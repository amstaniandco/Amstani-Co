import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import Stripe from "stripe";
import stripe from "../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { applyMonthlyImplementationFee } from "../../../../lib/store-billing";

type StoreBreakdownEntry = {
  storeId: string;
  orderId: string;
  stripeAccountId: string | null;
  transferAmount: number;
};

// POST /api/webhooks/stripe
// payment_intent.succeeded      → mark orders Paid + transfer 100% to each store owner
// payment_intent.payment_failed → mark orders Failed
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // ── Payment succeeded ─────────────────────────────────────────────────────
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderIds: string[] = JSON.parse(pi.metadata?.orderIds || "[]");
    const storeBreakdown: StoreBreakdownEntry[] = JSON.parse(pi.metadata?.storeBreakdown || "[]");

    // Mark all orders as Paid
    const validIds = orderIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (validIds.length) {
      await db.collection("orders").updateMany(
        { _id: { $in: validIds } },
        { $set: { paymentStatus: "Paid", paymentIntentId: pi.id, updatedAt: new Date() } }
      );

      // Decrement stock for each ordered item
      const orders = await db.collection("orders").find({ _id: { $in: validIds } }).toArray();
      type BulkOp = { updateOne: { filter: Record<string, unknown>; update: Record<string, unknown> } };
      const stockOps: BulkOp[] = [];
      for (const order of orders) {
        for (const item of (order.items ?? [])) {
          if (!item.productId || !order.storeId) continue;
          const qty = Math.max(1, Number(item.quantity) || 1);
          stockOps.push({
            updateOne: {
              filter: { storeId: order.storeId as string, productId: item.productId as string },
              update: { $inc: { quantity: -qty } },
            },
          });
        }
      }
      if (stockOps.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.collection("store_products").bulkWrite(stockOps as any, { ordered: false });
        // Clamp negatives to 0
        const affectedStoreIds = [...new Set(orders.map((o) => o.storeId as string))];
        await db.collection("store_products").updateMany(
          { storeId: { $in: affectedStoreIds }, quantity: { $lt: 0 } },
          { $set: { quantity: 0 } }
        );
      }
    }

    // Transfer store funds after collecting the monthly implementation fee.
    for (const entry of storeBreakdown) {
      if (!entry.stripeAccountId || entry.transferAmount <= 0) continue;

      try {
        const billing = await applyMonthlyImplementationFee(db, {
          storeId: entry.storeId,
          orderId: entry.orderId,
          paymentIntentId: pi.id,
          transferAmountCents: entry.transferAmount,
        });

        if (billing.netTransferCents <= 0) {
          await db.collection("orders").updateOne(
            { _id: new ObjectId(entry.orderId) },
            {
              $set: {
                stripeTransferStatus: "withheld_for_monthly_fee",
                implementationFeeCents: billing.deductedCents,
                netTransferCents: 0,
                monthlyFeePeriod: billing.period,
                updatedAt: new Date(),
              },
            }
          );
          continue;
        }

        await stripe.transfers.create({
          amount: billing.netTransferCents,
          currency: pi.currency,
          destination: entry.stripeAccountId,
          source_transaction: pi.latest_charge as string,
          metadata: {
            orderId: entry.orderId,
            storeId: entry.storeId,
            grossTransferCents: String(billing.grossTransferCents),
            implementationFeeCents: String(billing.deductedCents),
            billingPeriod: billing.period,
          },
        });

        await db.collection("orders").updateOne(
          { _id: new ObjectId(entry.orderId) },
          {
            $set: {
              stripeTransferStatus: "transferred",
              grossTransferCents: billing.grossTransferCents,
              implementationFeeCents: billing.deductedCents,
              netTransferCents: billing.netTransferCents,
              monthlyFeePeriod: billing.period,
              updatedAt: new Date(),
            },
          }
        );
      } catch (err) {
        console.error(`[stripe webhook] Transfer failed for ${entry.stripeAccountId}:`, err);
        if (ObjectId.isValid(entry.orderId)) {
          await db.collection("orders").updateOne(
            { _id: new ObjectId(entry.orderId) },
            {
              $set: {
                stripeTransferStatus: "failed",
                stripeTransferError: err instanceof Error ? err.message : String(err),
                updatedAt: new Date(),
              },
            }
          );
        }
      }
    }
  }

  // ── Payment failed ────────────────────────────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderIds: string[] = JSON.parse(pi.metadata?.orderIds || "[]");

    const validIds = orderIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (validIds.length) {
      await db.collection("orders").updateMany(
        { _id: { $in: validIds } },
        { $set: { paymentStatus: "Failed", updatedAt: new Date() } }
      );
    }
  }

  return NextResponse.json({ received: true });
}
