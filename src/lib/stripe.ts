import Stripe from "stripe";
import type { Db } from "mongodb";
import { ObjectId } from "mongodb";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing environment variable: "STRIPE_SECRET_KEY"');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-05-27.dahlia",
});

export default stripe;

export const STRIPE_CURRENCY = "usd";
export const MONTHLY_IMPLEMENTATION_FEE_CENTS = 1500;

// Customer Session features that let Stripe's PaymentElement show the customer's
// saved cards and offer a "Save this card" option — used at checkout and when
// adding a card from the profile. Cards saved this way become chargeable and
// redisplayable across future sessions.
export const PAYMENT_ELEMENT_SAVED_CARD_FEATURES = {
  payment_method_redisplay: "enabled",
  payment_method_save: "enabled",
  payment_method_save_usage: "off_session",
  payment_method_remove: "enabled",
} as const;

// Returns the user's Stripe Customer id, creating (and persisting) one on first
// use. Saved payment methods are attached to this customer.
export async function getOrCreateStripeCustomer(db: Db, userId: ObjectId): Promise<string> {
  const user = await db
    .collection("users")
    .findOne({ _id: userId }, { projection: { stripeCustomerId: 1, name: 1, email: 1 } });
  if (!user) throw new Error("User not found");
  if (typeof user.stripeCustomerId === "string" && user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    name: user.name || undefined,
    email: user.email || undefined,
    metadata: { userId: userId.toString() },
  });

  await db
    .collection("users")
    .updateOne({ _id: userId }, { $set: { stripeCustomerId: customer.id, updatedAt: new Date() } });

  return customer.id;
}

// Best-effort deletion of a user's Stripe Customer. Deleting the customer also
// detaches its saved payment methods. Never throws — a Stripe failure must not
// block account deletion; the missing/already-deleted case is a no-op.
export async function deleteStripeCustomer(customerId?: string | null): Promise<void> {
  if (!customerId) return;
  try {
    await stripe.customers.del(customerId);
  } catch (err) {
    console.error(`[stripe] Failed to delete customer ${customerId}:`, err);
  }
}
