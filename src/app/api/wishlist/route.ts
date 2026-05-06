import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ items: [] });

  const client = await clientPromise;
  const wishlist = await client.db(DB_NAME).collection("wishlists").findOne({ userId: user.id });
  return NextResponse.json({ items: wishlist?.items ?? [] });
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Sign in to use wishlist" }, { status: 401 });

  const { productId, storeId, storeName, name, sku, price, mainImage } = await req.json();
  if (!productId || !storeId) return NextResponse.json({ error: "productId and storeId required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const now = new Date();

  const wishlist = await db.collection("wishlists").findOne({ userId: user.id });

  if (!wishlist) {
    await db.collection("wishlists").insertOne({
      userId: user.id,
      items: [{ productId, storeId, storeName, name, sku, price, mainImage, addedAt: now }],
      updatedAt: now,
    });
    return NextResponse.json({ ok: true, action: "added" });
  }

  const exists = wishlist.items.some((i: { productId: string; storeId: string }) => i.productId === productId && i.storeId === storeId);
  if (exists) {
    const newItems = wishlist.items.filter((i: { productId: string; storeId: string }) => !(i.productId === productId && i.storeId === storeId));
    await db.collection("wishlists").updateOne({ userId: user.id }, { $set: { items: newItems, updatedAt: now } });
    return NextResponse.json({ ok: true, action: "removed" });
  }

  await db.collection("wishlists").updateOne(
    { userId: user.id },
    { $push: { items: { productId, storeId, storeName, name, sku, price, mainImage, addedAt: now } as never }, $set: { updatedAt: now } }
  );
  return NextResponse.json({ ok: true, action: "added" });
}

export async function DELETE(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, storeId, clearAll } = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (clearAll) {
    await db.collection("wishlists").updateOne({ userId: user.id }, { $set: { items: [], updatedAt: new Date() } });
  } else {
    const wishlist = await db.collection("wishlists").findOne({ userId: user.id });
    if (!wishlist) return NextResponse.json({ ok: true });
    const newItems = wishlist.items.filter((i: { productId: string; storeId: string }) => !(i.productId === productId && i.storeId === storeId));
    await db.collection("wishlists").updateOne({ userId: user.id }, { $set: { items: newItems, updatedAt: new Date() } });
  }

  return NextResponse.json({ ok: true });
}
