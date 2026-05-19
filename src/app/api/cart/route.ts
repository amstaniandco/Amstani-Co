import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

async function getUser() {
  const user = await getUserFromToken();
  if (!user) return null;
  return user;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ items: [] });

  const client = await clientPromise;
  const cart = await client.db(DB_NAME).collection("carts").findOne({ userId: user.id });
  return NextResponse.json({ items: cart?.items ?? [] });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in to use cart" }, { status: 401 });

  const { productId, storeId, storeName, name, sku, price, mainImage, quantity = 1 } = await req.json();
  if (!productId || !storeId) return NextResponse.json({ error: "productId and storeId required" }, { status: 400 });
  if (!ObjectId.isValid(productId) || !ObjectId.isValid(storeId)) {
    return NextResponse.json({ error: "Invalid product or store" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const now = new Date();
  const [product, store] = await Promise.all([
    db.collection("products").findOne({ _id: new ObjectId(productId) }),
    db.collection("stores").findOne({ _id: new ObjectId(storeId) }),
  ]);

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const normalizedItem = {
    productId,
    storeId,
    storeName: store.name ?? storeName ?? "Store",
    name: product.name ?? name ?? "Product",
    sku: product.sku ?? sku ?? "",
    price: Number(product.price ?? price ?? 0),
    mainImage: product.mainImage ?? mainImage ?? product.images?.[0]?.url ?? product.images?.[0] ?? null,
    quantity: Math.max(1, Number(quantity) || 1),
    addedAt: now,
  };

  const cart = await db.collection("carts").findOne({ userId: user.id });

  if (!cart) {
    await db.collection("carts").insertOne({
      userId: user.id,
      items: [normalizedItem],
      updatedAt: now,
    });
  } else {
    const idx = cart.items.findIndex((i: { productId: string; storeId: string }) => i.productId === productId && i.storeId === storeId);
    if (idx >= 0) {
      await db.collection("carts").updateOne(
        { userId: user.id },
        { $inc: { [`items.${idx}.quantity`]: normalizedItem.quantity }, $set: { updatedAt: now } }
      );
    } else {
      await db.collection("carts").updateOne(
        { userId: user.id },
        { $push: { items: normalizedItem as never }, $set: { updatedAt: now } }
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, storeId, quantity } = await req.json();
  if (!productId || !storeId || quantity == null) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const cart = await db.collection("carts").findOne({ userId: user.id });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  const idx = cart.items.findIndex((i: { productId: string; storeId: string }) => i.productId === productId && i.storeId === storeId);
  if (idx < 0) return NextResponse.json({ error: "Item not in cart" }, { status: 404 });

  if (quantity <= 0) {
    const newItems = cart.items.filter((_: unknown, i: number) => i !== idx);
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: newItems, updatedAt: new Date() } });
  } else {
    await db.collection("carts").updateOne(
      { userId: user.id },
      { $set: { [`items.${idx}.quantity`]: quantity, updatedAt: new Date() } }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, storeId, clearAll } = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (clearAll) {
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: [], updatedAt: new Date() } });
  } else {
    const cart = await db.collection("carts").findOne({ userId: user.id });
    if (!cart) return NextResponse.json({ ok: true });
    const newItems = cart.items.filter((i: { productId: string; storeId: string }) => !(i.productId === productId && i.storeId === storeId));
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: newItems, updatedAt: new Date() } });
  }

  return NextResponse.json({ ok: true });
}
