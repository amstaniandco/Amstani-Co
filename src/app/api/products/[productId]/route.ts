import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";

type Ctx = { params: Promise<{ productId: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const { productId } = await params;
  const url = new URL(req.url);
  const storeId = url.searchParams.get("storeId") ?? "";

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

  // Merge store-specific fields when storeId is provided
  if (storeId) {
    const sp = await db.collection("store_products").findOne({ storeId, productId });
    if (sp) {
      return NextResponse.json({
        product: {
          ...product,
          isCustomOrderEnabled: sp.isCustomOrderEnabled ?? false,
        },
      });
    }
  }

  return NextResponse.json({ product });
}
