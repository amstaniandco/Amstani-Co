import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import Stripe from "stripe";
import stripe from "../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../lib/db";

// POST /api/webhooks/stripe
// Stripe sends events here. Verify the signature, then:
//   payment_intent.succeeded      → mark orders Paid
//   payment_intent.payment_failed → mark orders Failed
//
// Register this URL in Stripe Dashboard → Developers → Webhooks.
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

    const validIds = orderIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (validIds.length) {
      await db.collection("orders").updateMany(
        { _id: { $in: validIds } },
        { $set: { paymentStatus: "Paid", paymentIntentId: pi.id, updatedAt: new Date() } }
      );
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
