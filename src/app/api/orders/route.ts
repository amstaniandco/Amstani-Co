import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

function orderNumber() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `ORD-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

type CartItem = {
  productId: string;
  storeId: string;
  storeName?: string;
  name?: string;
  sku?: string;
  price?: number;
  mainImage?: string | null;
  quantity: number;
};

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

  const cartItems = cart.items as CartItem[];
  const invalidItem = cartItems.find((item) => !ObjectId.isValid(item.storeId) || !ObjectId.isValid(item.productId));
  if (invalidItem) {
    return NextResponse.json({ error: "Cart contains an invalid product. Please remove it and try again." }, { status: 400 });
  }

  const productIds = [...new Set(cartItems.map((item) => item.productId))].map((id) => new ObjectId(id));
  const storeIds = [...new Set(cartItems.map((item) => item.storeId))].map((id) => new ObjectId(id));
  const [products, stores] = await Promise.all([
    db.collection("products").find({ _id: { $in: productIds } }).toArray(),
    db.collection("stores").find({ _id: { $in: storeIds } }).toArray(),
  ]);
  const productById = new Map(products.map((product) => [product._id.toString(), product]));
  const storeById = new Map(stores.map((store) => [store._id.toString(), store]));

  // Group cart items by storeId (one order per store).
  const storeMap = new Map<string, { storeName: string; items: CartItem[] }>();
  for (const item of cartItems) {
    const store = storeById.get(item.storeId);
    const product = productById.get(item.productId);
    if (!store || !product) {
      return NextResponse.json({ error: "A cart item is no longer available." }, { status: 400 });
    }

    const normalizedItem: CartItem = {
      productId: item.productId,
      storeId: item.storeId,
      storeName: store.name ?? item.storeName ?? "Store",
      name: product.name ?? item.name ?? "Product",
      sku: product.sku ?? item.sku ?? "",
      price: Number(product.price ?? item.price ?? 0),
      mainImage: product.mainImage ?? item.mainImage ?? product.images?.[0]?.url ?? product.images?.[0] ?? null,
      quantity: Math.max(1, Number(item.quantity) || 1),
    };

    if (!storeMap.has(item.storeId)) {
      storeMap.set(item.storeId, { storeName: normalizedItem.storeName || "Store", items: [] });
    }
    storeMap.get(item.storeId)!.items.push(normalizedItem);
  }

  const now = new Date();
  const insertedIds: string[] = [];

  for (const [storeId, { storeName, items }] of storeMap) {
    const subtotal = items.reduce((s, i) => s + Number(i.price ?? 0) * i.quantity, 0);
    const result = await db.collection("orders").insertOne({
      orderNumber: orderNumber(),
      customerId: user.id,
      customerName: userDoc?.name || "Customer",
      customerEmail: userDoc?.email || "",
      storeId,
      storeName,
      items: items.map((i) => ({
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
      billingAddress: shippingAddress,
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
