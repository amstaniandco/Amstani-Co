import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { createNotification } from "../../../lib/notify";

function generateClaimNumber(): string {
  return `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "user") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const claims = await db
    .collection("claims")
    .find({ customerId: user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ claims });
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "user") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { orderId, items, reason, description } = body;

  if (!orderId || !items?.length || !reason || !description?.trim()) {
    return NextResponse.json(
      { error: "orderId, items, reason, and description are required" },
      { status: 400 }
    );
  }

  if (!ObjectId.isValid(orderId)) {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const order = await db.collection("orders").findOne({
    _id: new ObjectId(orderId),
    customerId: user.id,
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const existingClaim = await db
    .collection("claims")
    .findOne({ orderId, customerId: user.id });
  if (existingClaim) {
    return NextResponse.json(
      { error: "A claim already exists for this order" },
      { status: 409 }
    );
  }

  const userDoc = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user.id) }, { projection: { name: 1 } });

  const now = new Date();
  const claim = {
    claimNumber: generateClaimNumber(),
    orderId,
    customerId: user.id,
    customerName: userDoc?.name || order.customerName || "Customer",
    storeId: order.storeId,
    storeName: order.storeName || "Store",
    reason,
    description,
    items,
    status: "open" as const,
    messages: [
      {
        senderId: user.id,
        senderName: userDoc?.name || "Customer",
        senderRole: "user" as const,
        content: description,
        timestamp: now,
      },
    ],
    ownerLastActionAt: null,
    adminIntervened: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("claims").insertOne(claim);
  const claimId = result.insertedId.toString();

  // Notify the store owner
  const store = await db
    .collection("stores")
    .findOne({ _id: new ObjectId(order.storeId) }, { projection: { ownerId: 1 } });
  if (store?.ownerId) {
    await createNotification({
      userId: store.ownerId.toString(),
      title: "New Claim Filed",
      message: `${claim.customerName} filed a claim (#${claim.claimNumber}) on order ${order.orderNumber || orderId}. Reason: ${reason}.`,
      referenceId: claimId,
    });
  }

  return NextResponse.json({ ok: true, claimId }, { status: 201 });
}
