import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

type Ctx = { params: Promise<{ storeId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { storeId } = await params;

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const storeProducts = await db
    .collection("store_products")
    .find({ storeId })
    .sort({ listedAt: -1 })
    .toArray();

  const productIds = storeProducts
    .map((item) => item.productId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  const products = productIds.length
    ? await db.collection("products").find({ _id: { $in: productIds } }).toArray()
    : [];
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const mergedProducts = storeProducts.map((sp) => {
    const global = productMap.get(sp.productId);

    // Resolve selling price: sellingPrice > price > global.price
    const sellingPrice: number = sp.sellingPrice ?? sp.price ?? global?.price ?? 0;

    // Effective price after discount
    const discountPercent: number = (sp.isOnSale && sp.discountPercent > 0) ? sp.discountPercent : 0;
    const effectivePrice = sellingPrice * (1 - discountPercent / 100);

    return {
      ...(global ?? {}),
      ...sp,
      name: sp.name ?? global?.name,
      sku: sp.sku ?? global?.sku,
      // What the customer sees and pays
      price: Math.round(effectivePrice * 100) / 100,
      compareAtPrice: discountPercent > 0 ? sellingPrice : (global?.compareAtPrice ?? null),
      mainImage: sp.mainImage ?? global?.mainImage ?? global?.images?.[0]?.imageUrl ?? null,
      // Keep meta for cart/checkout
      originalPrice: sp.originalPrice ?? global?.price ?? 0,
      sellingPrice,
      discountPercent,
      isOnSale: sp.isOnSale ?? false,
    };
  });

  return NextResponse.json({ products: mergedProducts });
}
