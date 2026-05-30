import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import stripe from "../../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

// POST /api/stripe/connect/onboard
// Creates (or resumes) a Stripe Express account for the store owner
// and returns the hosted onboarding URL.
export async function POST() {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) {
    return NextResponse.json({ error: "Store not found. Set up your store first." }, { status: 404 });
  }

  let stripeAccountId = store.stripeAccountId as string | undefined;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { storeId: store._id.toString(), ownerId: user.id },
    });
    stripeAccountId = account.id;

    await db.collection("stores").updateOne(
      { _id: store._id },
      { $set: { stripeAccountId, updatedAt: new Date() } }
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${origin}/owner/stripe?refresh=true`,
    return_url: `${origin}/owner/stripe?success=true`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
