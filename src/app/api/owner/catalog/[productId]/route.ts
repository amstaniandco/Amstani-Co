import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

const CONFIG_ID = "pricing_config";

export async function PATCH(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { productId } = await params;
  const body = await req.json();

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const storeId = store._id.toString();

  const entry = await db.collection("owner_catalog").findOne({ storeId, productId });
  if (!entry) return NextResponse.json({ error: "Product not found in catalog" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = await db.collection("pricing_config").findOne({ _id: CONFIG_ID as any });
  const markupPercent: number = config?.markupPercent ?? 20;
  const maxPrice = (entry.originalPrice ?? 0) * (1 + markupPercent / 100);

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.price === "number") {
    if (body.price < 0) return NextResponse.json({ error: "Price cannot be negative." }, { status: 400 });
    if (body.price > maxPrice) return NextResponse.json({ error: `Price cannot exceed $${maxPrice.toFixed(2)}.` }, { status: 400 });
    updates.price = Number(body.price.toFixed(2));
  }

  await db.collection("owner_catalog").updateOne({ storeId, productId }, { $set: updates });
  return NextResponse.json({ ok: true });
}
