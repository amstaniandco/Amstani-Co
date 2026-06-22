import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";

type Ctx = { params: Promise<{ productId: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const { productId } = await params;
  const storeId = new URL(req.url).searchParams.get("storeId") ?? null;

  let id: ObjectId;
  try {
    id = new ObjectId(productId);
  } catch {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const product = await db.collection("products").findOne({ _id: id });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let stock: number | null = null;
  if (storeId) {
    const sp = await db.collection("store_products").findOne(
      { storeId, productId },
      { projection: { quantity: 1 } }
    );
    stock = sp?.quantity ?? null;
  }

  return NextResponse.json({
    product: {
      ...product,
      isCustomOrderEnabled: product.allowCustomOrders ?? false,
      ...(stock !== null ? { stock } : {}),
    },
  });
}
