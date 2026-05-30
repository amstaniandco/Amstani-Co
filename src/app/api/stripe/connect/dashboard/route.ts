import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import stripe from "../../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

// POST /api/stripe/connect/dashboard
// Returns a one-time Stripe Express dashboard login URL for the store owner
// so they can view their payouts and transaction history.
export async function POST() {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store?.stripeAccountId) {
    return NextResponse.json({ error: "No Stripe account connected yet." }, { status: 400 });
  }

  const loginLink = await stripe.accounts.createLoginLink(store.stripeAccountId as string);

  return NextResponse.json({ url: loginLink.url });
}
