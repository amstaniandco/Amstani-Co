import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import Stripe from "stripe";
import stripe from "../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { applyMonthlyImplementationFee } from "../../../../lib/store-billing";
import { maintenanceFeeDeductedEmail, sendEmail } from "../../../../lib/email";
import { finalizeOrderStock } from "../../../../lib/order-stock";

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

  // Connect account status changes are delivered as account.updated events
  // when the endpoint is configured to receive events from connected accounts.
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    await db.collection("stores").updateOne(
      { stripeAccountId: account.id },
      {
        $set: {
          stripeChargesEnabled: account.charges_enabled,
          stripePayoutsEnabled: account.payouts_enabled,
          stripeDetailsSubmitted: account.details_submitted,
          stripeDisabledReason: account.requirements?.disabled_reason ?? null,
          stripeRequirementsDue: account.requirements?.currently_due ?? [],
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ received: true });
  }

  // ── Payment succeeded ─────────────────────────────────────────────────────
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderIds: string[] = JSON.parse(pi.metadata?.orderIds || "[]");
    const storeBreakdown: StoreBreakdownEntry[] = JSON.parse(pi.metadata?.storeBreakdown || "[]");

    // Mark all orders as Paid
    const validIds = orderIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (validIds.length) {
      const pendingOrders = await db.collection("pending_checkouts").find({ _id: { $in: validIds } }).toArray();
      if (pendingOrders.length) {
        await db.collection("orders").insertMany(
          pendingOrders.map((order) => ({ ...order, paymentStatus: "Pending", updatedAt: new Date() })),
          { ordered: true },
        );
        await db.collection("pending_checkouts").deleteMany({ _id: { $in: validIds } });
      }
      await db.collection("orders").updateMany(
        { _id: { $in: validIds } },
        { $set: { paymentStatus: "Paid", paymentIntentId: pi.id, updatedAt: new Date() } }
      );

      const orders = await db.collection("orders").find({ _id: { $in: validIds } }).toArray();
      await finalizeOrderStock(db, orders);
      const customerId = orders[0]?.customerId;
      if (customerId) {
        await db.collection("carts").updateOne(
          { userId: customerId },
          { $set: { items: [], updatedAt: new Date() } },
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

        if (billing.deductedCents > 0 && ObjectId.isValid(entry.storeId)) {
          const store = await db.collection("stores").findOne(
            { _id: new ObjectId(entry.storeId) },
            { projection: { name: 1, ownerId: 1 } },
          );
          const owner = store?.ownerId
            ? await db.collection("users").findOne(
                { _id: store.ownerId },
                { projection: { name: 1, email: 1 } },
              )
            : null;

          if (owner?.email) {
            const feeEmail = maintenanceFeeDeductedEmail({
              ownerName: owner.name,
              storeName: store?.name,
              amountCents: billing.deductedCents,
              period: billing.period,
              remainingCents: billing.remainingFeeCents,
            });
            void sendEmail({ to: owner.email, subject: feeEmail.subject, html: feeEmail.html });
          }
        }

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
      await db.collection("pending_checkouts").deleteMany({ _id: { $in: validIds } });
      await db.collection("orders").updateMany(
        { _id: { $in: validIds } },
        { $set: { paymentStatus: "Failed", updatedAt: new Date() } }
      );
    }
  }

  return NextResponse.json({ received: true });
}
