import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

const CONFIG_ID = "pricing_config";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
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

  const storeProduct = await db.collection("store_products").findOne({ storeId, productId });
  if (!storeProduct) return NextResponse.json({ error: "Product not found in your store" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = await db.collection("pricing_config").findOne({ _id: CONFIG_ID as any });
  const markupPercent: number = config?.markupPercent ?? 20;
  const discountCap: number = config?.discountCap ?? 20;

  const originalPrice: number = storeProduct.originalPrice ?? storeProduct.price ?? 0;
  const maxSellingPrice = originalPrice * (1 + markupPercent / 100);

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.sellingPrice === "number") {
    const sp = Number(body.sellingPrice.toFixed(2));
    if (sp < 0) return NextResponse.json({ error: "Selling price cannot be negative." }, { status: 400 });
    if (sp > maxSellingPrice) {
      return NextResponse.json({
        error: `Selling price cannot exceed PKR ${maxSellingPrice.toFixed(2)} (original PKR ${originalPrice.toFixed(2)} + ${markupPercent}% markup).`,
      }, { status: 400 });
    }
    updates.sellingPrice = sp;
    updates.price = sp;
  }

  if (typeof body.discountPercent === "number") {
    const dp = Math.round(body.discountPercent * 100) / 100;
    if (dp < 0 || dp > discountCap) {
      return NextResponse.json({ error: `Discount cannot exceed ${discountCap}% (platform limit).` }, { status: 400 });
    }
    updates.discountPercent = dp;
  }

  if (typeof body.isOnSale === "boolean") {
    updates.isOnSale = body.isOnSale;
    if (!body.isOnSale) updates.discountPercent = 0;
  }

  if (typeof body.isNewArrival === "boolean") {
    updates.isNewArrival = body.isNewArrival;
  }

  // ── Variant price overrides ───────────────────────────────────────────────
  // body.variantPrices: { [variantId]: number }
  // Each price is validated against the catalog variant's priceOverride × (1 + markupPercent/100)
  if (body.variantPrices != null && typeof body.variantPrices === "object" && !Array.isArray(body.variantPrices)) {
    // Fetch global product to get original variant priceOverrides
    const globalProduct = ObjectId.isValid(productId)
      ? await db.collection("products").findOne(
          { _id: new ObjectId(productId) },
          { projection: { variants: 1 } }
        )
      : null;

    // Build a map of variantId → original priceOverride (only variants that have one)
    const catalogOverrides = new Map<string, number>();
    for (const v of globalProduct?.variants ?? []) {
      if (v.priceOverride != null) catalogOverrides.set(String(v.id), Number(v.priceOverride));
    }

    const validated: Record<string, number> = {};
    for (const [variantId, priceRaw] of Object.entries(body.variantPrices)) {
      const catalogPrice = catalogOverrides.get(variantId);
      if (catalogPrice == null) {
        return NextResponse.json(
          { error: `Variant "${variantId}" does not have a price override in the catalog.` },
          { status: 400 }
        );
      }
      const price = Number(priceRaw);
      if (isNaN(price) || price < 0) {
        return NextResponse.json({ error: `Invalid price for variant "${variantId}".` }, { status: 400 });
      }
      const maxVariantPrice = catalogPrice * (1 + markupPercent / 100);
      if (price > maxVariantPrice) {
        return NextResponse.json(
          { error: `Variant price PKR ${price} exceeds the maximum of PKR ${maxVariantPrice.toFixed(2)} (catalog PKR ${catalogPrice} + ${markupPercent}% markup).` },
          { status: 400 }
        );
      }
      validated[variantId] = price;
    }

    // Merge with any existing variant prices rather than overwriting all
    const existing = (storeProduct.variantPrices as Record<string, number>) ?? {};
    updates.variantPrices = { ...existing, ...validated };
  }

  await db.collection("store_products").updateOne({ storeId, productId }, { $set: updates });

  return NextResponse.json({ ok: true, updates });
}
