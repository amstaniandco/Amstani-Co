import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { getUserFromToken } from "../../../../../../lib/auth";
import stripe, { STRIPE_CURRENCY } from "../../../../../../lib/stripe";

const REFERRAL_BONUS_CENTS = 10_000; // $100
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.amstaniandco.com").replace(/\/$/, "");

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid application id" }, { status: 400 });
    }

    const body = await req.json();
    const action = body?.action as "approve" | "deny";
    if (action !== "approve" && action !== "deny") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const status = action === "approve" ? "approved_by_admin" : "denied_by_admin";

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const application = await db.collection("store_applications").findOne({ _id: new ObjectId(id) });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status === "approved_by_admin" || application.status === "denied_by_admin") {
      return NextResponse.json({ error: "Application has already been reviewed" }, { status: 409 });
    }

    const update: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
      reviewedByAdminId: new ObjectId(tokenUser.id),
      reviewedAt: new Date(),
    };

    if (action === "approve") {
      update.ownerSignupLink = `${APP_URL}/store-signup`;

      // Transfer $100 referral bonus to the store owner's Stripe connected account
      if (application.storeId) {
        const store = await db.collection("stores").findOne({ _id: new ObjectId(application.storeId.toString()) });
        if (store?.stripeAccountId) {
          try {
            const transfer = await stripe.transfers.create({
              amount: REFERRAL_BONUS_CENTS,
              currency: STRIPE_CURRENCY,
              destination: store.stripeAccountId as string,
              metadata: {
                applicationId: id,
                storeId: application.storeId.toString(),
                ownerId: application.ownerId?.toString() ?? "",
                type: "referral_bonus",
              },
            });
            update.referralBonusTransferId = transfer.id;
            update.referralBonusPaid = true;
          } catch (err) {
            console.error("[admin approve] Stripe referral transfer failed:", err);
          }
        }
      }
    }

    await db.collection("store_applications").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    return NextResponse.json({ message: `Application ${action}d successfully` }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/stores/applications/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
