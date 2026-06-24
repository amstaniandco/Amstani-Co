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

  if (!product || product.brandSuspended || product.isSuspended) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let stock: number | null = null;
  let variantPrices: Record<string, number> = {};
  let storeSellingPrice: number | null = null;
  let storeDiscountPercent: number = 0;
  let storeIsOnSale: boolean = false;

  if (storeId) {
    const sp = await db.collection("store_products").findOne(
      { storeId, productId },
      { projection: { quantity: 1, variantPrices: 1, sellingPrice: 1, discountPercent: 1, isOnSale: 1 } }
    );
    stock            = sp?.quantity ?? null;
    variantPrices    = (sp?.variantPrices as Record<string, number>) ?? {};
    storeSellingPrice   = sp?.sellingPrice ?? null;
    storeDiscountPercent = (sp?.isOnSale && sp?.discountPercent > 0) ? (sp.discountPercent as number) : 0;
    storeIsOnSale    = sp?.isOnSale ?? false;
  }

  // Effective price from store (already accounts for discount in store_products route,
  // but here we compute it fresh for the single-product detail page)
  const basePrice: number = storeSellingPrice ?? (product.adminAdjustedPrice as number) ?? (product.price as number) ?? 0;
  const effectivePrice: number = Math.round(basePrice * (1 - storeDiscountPercent / 100) * 100) / 100;

  // Merge store owner's variant price overrides so the customer sees the correct price
  const variants = ((product.variants ?? []) as Array<Record<string, unknown>>).map((v) => {
    const storePrice = variantPrices[v.id as string];
    return storePrice != null ? { ...v, priceOverride: storePrice } : v;
  });

  return NextResponse.json({
    product: {
      ...product,
      variants,
      isCustomOrderEnabled: product.allowCustomOrders ?? false,
      // Store-specific pricing overlays
      price: effectivePrice,
      sellingPrice: basePrice,
      discountPercent: storeDiscountPercent,
      isOnSale: storeIsOnSale,
      compareAtPrice: storeDiscountPercent > 0 ? basePrice : (product.compareAtPrice ?? null),
      ...(stock !== null ? { stock } : {}),
    },
  });
}
