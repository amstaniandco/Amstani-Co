import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import stripe from "../../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

// POST /api/stripe/connect/link
// Saves an existing Stripe account ID to the store document
// instead of creating a new Express account.
export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stripeAccountId } = await req.json();
  if (!stripeAccountId?.startsWith("acct_")) {
    return NextResponse.json({ error: "Invalid account ID. It must start with acct_" }, { status: 400 });
  }

  // Verify the account actually exists on this platform
  try {
    await stripe.accounts.retrieve(stripeAccountId);
  } catch {
    return NextResponse.json({ error: "Account not found. Make sure this account belongs to your Stripe platform." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  await db.collection("stores").updateOne(
    { _id: store._id },
    { $set: { stripeAccountId, updatedAt: new Date() } }
  );

  return NextResponse.json({ ok: true });
}
