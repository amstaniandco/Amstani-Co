import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sinceOrders = searchParams.get("since_orders");
  const sinceClaims = searchParams.get("since_claims");
  const sinceNotifications = searchParams.get("since_notifications");
  const sinceRequests = searchParams.get("since_requests");

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne(
    { ownerId: new ObjectId(user.id) },
    { projection: { _id: 1 } },
  );
  if (!store) return NextResponse.json({ orders: 0, claims: 0, notifications: 0, listing_requests: 0 });

  const storeId = store._id.toString();

  const ordersFilter: Record<string, unknown> = { storeId, status: "Incoming" };
  if (sinceOrders) ordersFilter.createdAt = { $gte: new Date(sinceOrders) };

  const claimsFilter: Record<string, unknown> = { storeId, status: "open" };
  if (sinceClaims) claimsFilter.updatedAt = { $gte: new Date(sinceClaims) };

  const notifFilter: Record<string, unknown> = { userId: new ObjectId(user.id), isRead: { $ne: true } };
  if (sinceNotifications) notifFilter.createdAt = { $gte: new Date(sinceNotifications) };

  const requestsFilter: Record<string, unknown> = { storeId, status: { $ne: "pending" } };
  if (sinceRequests) requestsFilter.updatedAt = { $gte: new Date(sinceRequests) };

  const [incomingOrders, openClaims, unreadNotifications, listingRequests] = await Promise.all([
    db.collection("orders").countDocuments(ordersFilter),
    db.collection("claims").countDocuments(claimsFilter),
    db.collection("notifications").countDocuments(notifFilter),
    db.collection("listing_requests").countDocuments(requestsFilter),
  ]);

  return NextResponse.json({
    orders: incomingOrders,
    claims: openClaims,
    notifications: unreadNotifications,
    listing_requests: listingRequests,
  });
}
