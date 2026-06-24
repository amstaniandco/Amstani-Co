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
    ? await db.collection("products").find({ _id: { $in: productIds }, brandSuspended: { $ne: true }, isSuspended: { $ne: true } }).toArray()
    : [];
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const mergedProducts = storeProducts.filter((sp) => productMap.has(sp.productId)).map((sp) => {
    const global = productMap.get(sp.productId);

    const sellingPrice: number = sp.sellingPrice ?? global?.adminAdjustedPrice ?? sp.price ?? global?.price ?? 0;
    const discountPercent: number = (sp.isOnSale && sp.discountPercent > 0) ? sp.discountPercent : 0;
    const effectivePrice = sellingPrice * (1 - discountPercent / 100);

    // Build explicit category tags from the global product definition
    const categoryTags: string[] = [];
    if (Array.isArray(global?.categories)) {
      for (const c of global.categories) {
        const name = c?.category?.name;
        if (name && !categoryTags.includes(name)) categoryTags.push(name);
      }
    }
    if (categoryTags.length === 0 && global?.category) {
      categoryTags.push(String(global.category));
    }

    // Merge store owner's variant price overrides into the global variant list
    const storeVariantPrices = (sp.variantPrices as Record<string, number>) ?? {};
    const variants = ((global?.variants ?? []) as Array<Record<string, unknown>>).map((v) => {
      const storePrice = storeVariantPrices[v.id as string];
      return storePrice != null ? { ...v, priceOverride: storePrice } : v;
    });

    return {
      ...(global ?? {}),
      ...sp,
      name: sp.name ?? global?.name,
      sku: sp.sku ?? global?.sku,
      price: Math.round(effectivePrice * 100) / 100,
      compareAtPrice: discountPercent > 0 ? sellingPrice : (global?.compareAtPrice ?? null),
      mainImage: sp.mainImage ?? global?.mainImage ?? global?.images?.[0]?.imageUrl ?? null,
      originalPrice: sp.originalPrice ?? global?.price ?? 0,
      sellingPrice,
      discountPercent,
      isOnSale: sp.isOnSale ?? false,
      categoryTags,
      variants,
    };
  });

  return NextResponse.json({ products: mergedProducts });
}
