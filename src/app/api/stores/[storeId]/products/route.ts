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
    .filter((productId) => ObjectId.isValid(productId))
    .map((productId) => new ObjectId(productId));

  const products = productIds.length
    ? await db.collection("products").find({ _id: { $in: productIds } }).toArray()
    : [];
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const mergedProducts = storeProducts.map((storeProduct) => {
    const product = productMap.get(storeProduct.productId);
    if (!product) return storeProduct;

    return {
      ...product,
      ...storeProduct,
      name: storeProduct.name ?? product.name,
      sku: storeProduct.sku ?? product.sku,
      price: storeProduct.price ?? product.price,
      mainImage: storeProduct.mainImage ?? product.mainImage ?? product.images?.[0]?.url ?? product.images?.[0] ?? null,
    };
  });

  return NextResponse.json({ products: mergedProducts });
}
