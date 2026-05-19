import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

const validStatuses = ["Incoming", "Accepted", "Rejected", "On Hold", "Dispatched", "Shipped", "Delivered"];

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ orders: [] });
  const storeId = store._id.toString();

  const orders = await db
    .collection("orders")
    .find({ $or: [{ storeId }, { storeId: store._id }] })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ orders, storeName: store.name });
}

export async function PATCH(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderId, status } = await req.json();
  if (!orderId || !ObjectId.isValid(orderId) || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid orderId or status" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const result = await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId), $or: [{ storeId: store._id.toString() }, { storeId: store._id }] },
    { $set: { status, updatedAt: new Date() } }
  );

  if (!result.matchedCount) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
