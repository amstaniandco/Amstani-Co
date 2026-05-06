import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

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
    .collection("orders")
    .find({ storeId: store._id.toString() })
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
  const validStatuses = ["Incoming", "Accepted", "On Hold", "Shipped"];
  if (!orderId || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid orderId or status" }, { status: 400 });
  }

  const client = await clientPromise;
  await client.db(DB_NAME).collection("orders").updateOne(
    { _id: new ObjectId(orderId) },
    { $set: { status, updatedAt: new Date() } }
  );

  return NextResponse.json({ ok: true });
}
