import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import Stripe from "stripe";
import stripe from "../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../lib/db";

type StoreBreakdownEntry = {
  storeId: string;
  orderId: string;
  stripeAccountId: string | null;
  transferAmount: number;
};

// POST /api/webhooks/stripe
// Stripe sends events here. Verify the signature, then:
//   payment_intent.succeeded  → mark orders Paid, transfer 80% to each store
//   payment_intent.payment_failed → mark orders Failed
//   account.updated           → sync store owner's Stripe account status
//
// Register this URL in Stripe Dashboard → Developers → Webhooks.
// Enable "Listen to events on Connected accounts" for account.updated.
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
    }

    // Transfer 80% to each store owner that has a connected Stripe account
    for (const entry of storeBreakdown) {
      if (!entry.stripeAccountId || entry.transferAmount <= 0) continue;

      try {
        await stripe.transfers.create({
          amount: entry.transferAmount,
          currency: pi.currency,
          destination: entry.stripeAccountId,
          // source_transaction ties the transfer to the original charge on the platform account
          source_transaction: pi.latest_charge as string,
          metadata: { orderId: entry.orderId, storeId: entry.storeId },
        });
      } catch (err) {
        // Log and continue — do not fail the whole webhook.
        // Unprocessed transfers can be retried manually from the Stripe dashboard.
        console.error(`[stripe webhook] Transfer failed for account ${entry.stripeAccountId}:`, err);
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

  // ── Store owner account updated ───────────────────────────────────────────
  // Fires when an Express account completes or updates onboarding.
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await db.collection("stores").updateOne(
      { stripeAccountId: account.id },
      {
        $set: {
          stripeChargesEnabled: account.charges_enabled,
          stripePayoutsEnabled: account.payouts_enabled,
          stripeDetailsSubmitted: account.details_submitted,
          updatedAt: new Date(),
        },
      }
    );
  }

  return NextResponse.json({ received: true });
}
