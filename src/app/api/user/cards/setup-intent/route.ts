import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import stripe, { getOrCreateStripeCustomer } from "../../../../../lib/stripe";

function getUserObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// POST /api/user/cards/setup-intent
// Creates a SetupIntent so the profile can collect + save a card with Stripe
// Elements (no charge). The resulting payment method attaches to the customer.
export async function POST() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const customerId = await getOrCreateStripeCustomer(db, userId);

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: "off_session",
      // Card only (incl. Apple/Google Pay). Excludes Link so the profile form
      // collects and saves a real card on the customer rather than a Link account.
      payment_method_types: ["card"],
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret }, { status: 200 });
  } catch (error) {
    console.error("POST /api/user/cards/setup-intent error:", error);
    return NextResponse.json({ error: "Failed to start card setup" }, { status: 500 });
  }
}
