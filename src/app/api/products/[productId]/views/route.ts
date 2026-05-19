import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

type Ctx = { params: Promise<{ productId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { productId } = await params;
  if (!ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const { storeId } = await req.json().catch(() => ({ storeId: "" }));
  if (!storeId || !ObjectId.isValid(storeId)) {
    return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const [product, store] = await Promise.all([
    db.collection("products").findOne({ _id: new ObjectId(productId) }, { projection: { _id: 1 } }),
    db.collection("stores").findOne({ _id: new ObjectId(storeId) }, { projection: { _id: 1 } }),
  ]);
  if (!product || !store) return NextResponse.json({ error: "Product or store not found" }, { status: 404 });

  await db.collection("product_views").insertOne({
    productId,
    storeId,
    userAgent: req.headers.get("user-agent") ?? "",
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
