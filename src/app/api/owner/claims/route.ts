import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { createNotification } from "../../../../lib/notify";

const ESCALATION_DAYS = 4;

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db
    .collection("stores")
    .findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ claims: [], storeName: "", stats: { total: 0, escalated: 0 } });

  const storeId = store._id.toString();

  // Find open claims that have been ignored for 4+ days before escalating
  const escalationThreshold = new Date();
  escalationThreshold.setDate(escalationThreshold.getDate() - ESCALATION_DAYS);

  const toEscalate = await db
    .collection("claims")
    .find({
      storeId,
      status: "open",
      ownerLastActionAt: null,
      createdAt: { $lte: escalationThreshold },
    })
    .project({ _id: 1, customerId: 1, claimNumber: 1 })
    .toArray();

  if (toEscalate.length > 0) {
    const ids = toEscalate.map((c) => c._id);
    await db.collection("claims").updateMany(
      { _id: { $in: ids } },
      { $set: { status: "admin_escalated", updatedAt: new Date() } }
    );

    // Notify each affected customer and find admins to notify
    const adminUsers = await db
      .collection("users")
      .find({ role: "admin" }, { projection: { _id: 1 } })
      .toArray();

    for (const claim of toEscalate) {
      await createNotification({
        userId: claim.customerId,
        title: "Your Claim Has Been Escalated",
        message: `Your claim #${claim.claimNumber} was not addressed by the store within 4 days and has been escalated to our admin team.`,
        referenceId: claim._id.toString(),
      });

      for (const admin of adminUsers) {
        await createNotification({
          userId: admin._id.toString(),
          title: "Claim Escalated — Action Required",
          message: `Claim #${claim.claimNumber} was auto-escalated because the store owner did not respond within 4 days.`,
          referenceId: claim._id.toString(),
        });
      }
    }
  }

  const claims = await db
    .collection("claims")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .toArray();

  // Bulk-fetch order numbers so the UI can display them without N+1 queries
  const validOrderIds = claims
    .map((c) => c.orderId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  const orderNumberMap = new Map<string, string>();
  if (validOrderIds.length) {
    const orderDocs = await db
      .collection("orders")
      .find({ _id: { $in: validOrderIds } }, { projection: { _id: 1, orderNumber: 1 } })
      .toArray();
    for (const o of orderDocs) {
      orderNumberMap.set(o._id.toString(), o.orderNumber || "");
    }
  }

  const enrichedClaims = claims.map((c) => ({
    ...c,
    orderNumber: orderNumberMap.get(c.orderId) || "",
  }));

  const total = claims.filter((c) => c.status !== "resolved").length;
  const escalated = claims.filter((c) => c.status === "admin_escalated").length;

  return NextResponse.json({ claims: enrichedClaims, storeName: store.name, stats: { total, escalated } });
}
