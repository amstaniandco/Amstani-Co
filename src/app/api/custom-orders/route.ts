import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

function customOrderNumber() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `CORD-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ orders: [] });

  const client = await clientPromise;
  const orders = await client
    .db(DB_NAME)
    .collection("custom_orders")
    .find({ userId: user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Sign in to place a custom order." }, { status: 401 });

  const body = await req.json();
  const { productId, storeId, productName, storeName, description, mediaUrls } = body;

  if (!productId || !storeId) {
    return NextResponse.json({ error: "Missing product or store." }, { status: 400 });
  }
  if (!description?.trim()) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }
  if (!Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // Verify the global catalog product has custom orders enabled
  let catalogProduct = null;
  try {
    catalogProduct = await db.collection("products").findOne({ _id: new ObjectId(productId) });
  } catch { /* invalid id */ }
  if (!catalogProduct?.allowCustomOrders) {
    return NextResponse.json({ error: "Custom orders are not enabled for this product." }, { status: 403 });
  }

  // Fetch customer info
  let customerEmail = "";
  let customerName = "";
  try {
    const userDoc = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
    customerEmail = userDoc?.email ?? "";
    customerName = userDoc?.name ?? userDoc?.displayName ?? "";
  } catch { /* ignore */ }

  const order = {
    orderNumber: customOrderNumber(),
    userId: user.id,
    customerEmail,
    customerName,
    productId,
    storeId,
    productName: productName ?? "",
    storeName: storeName ?? "",
    description: description.trim(),
    mediaUrls: mediaUrls.slice(0, 10),
    status: "Pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("custom_orders").insertOne(order);
  return NextResponse.json({ ok: true, orderId: result.insertedId.toString(), orderNumber: order.orderNumber });
}
