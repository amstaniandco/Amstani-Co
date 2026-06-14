import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

const validStatuses = ["Pending", "Accepted", "Rejected", "In Progress", "Completed"];

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

  const orders = await db
    .collection("custom_orders")
    .find({ storeId: store._id.toString() })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId, status } = body;

  if (!orderId || !status) {
    return NextResponse.json({ error: "orderId and status are required." }, { status: 400 });
  }
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Valid: ${validStatuses.join(", ")}` }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  let id: ObjectId;
  try {
    id = new ObjectId(orderId);
  } catch {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
  }

  const result = await db.collection("custom_orders").updateOne(
    { _id: id, storeId: store._id.toString() },
    { $set: { status, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Order not found or not yours." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
