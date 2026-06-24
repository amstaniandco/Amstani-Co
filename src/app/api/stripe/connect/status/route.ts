import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import stripe from "../../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { getMonthlyImplementationFeeStatus } from "../../../../../lib/store-billing";

// GET /api/stripe/connect/status
// Returns whether the store owner's Stripe account is verified and ready to receive payouts.
export async function GET() {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store?.stripeAccountId) {
    return NextResponse.json({
      connected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      monthlyFee: store?._id ? await getMonthlyImplementationFeeStatus(db, store._id.toString()) : null,
    });
  }

  const account = await stripe.accounts.retrieve(store.stripeAccountId as string);

  return NextResponse.json({
    connected: true,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    monthlyFee: await getMonthlyImplementationFeeStatus(db, store._id.toString()),
  });
}
