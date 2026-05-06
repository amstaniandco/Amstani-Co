import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

function orderNumber() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `ORD-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Sign in to place an order" }, { status: 401 });

  const { shippingAddress, notes } = await req.json();
  if (!shippingAddress?.fullName || !shippingAddress?.line1 || !shippingAddress?.city) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const cart = await db.collection("carts").findOne({ userId: user.id });
  if (!cart || !cart.items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const userDoc = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user.id) }, { projection: { name: 1, email: 1 } });

  // Group cart items by storeId (one order per store)
  const storeMap = new Map<string, { storeName: string; items: typeof cart.items }>();
  for (const item of cart.items) {
    if (!storeMap.has(item.storeId)) {
      storeMap.set(item.storeId, { storeName: item.storeName || "Store", items: [] });
    }
    storeMap.get(item.storeId)!.items.push(item);
  }

  const now = new Date();
  const insertedIds: string[] = [];

  for (const [storeId, { storeName, items }] of storeMap) {
    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
    const result = await db.collection("orders").insertOne({
      orderNumber: orderNumber(),
      customerId: user.id,
      customerName: userDoc?.name || "Customer",
      customerEmail: userDoc?.email || "",
      storeId,
      storeName,
      items: items.map((i: { productId: string; name: string; sku: string; price: number; mainImage?: string; quantity: number }) => ({
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        price: i.price,
        mainImage: i.mainImage ?? null,
        quantity: i.quantity,
      })),
      subtotal,
      shippingFee: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: subtotal,
      status: "Incoming",
      paymentStatus: "Pending",
      paymentMethod: "Cash on Delivery",
      shippingAddress,
      notes: notes || "",
      createdAt: now,
      updatedAt: now,
    });
    insertedIds.push(result.insertedId.toString());
  }

  // Clear cart after order
  await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: [], updatedAt: now } });

  return NextResponse.json({ ok: true, orderIds: insertedIds }, { status: 201 });
}
