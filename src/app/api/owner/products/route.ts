import { NextResponse } from "next/server";
import { ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { resolveEffectivePricingRule } from "../../../../lib/pricing-config";

const CONFIG_ID = "pricing_config";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const [store, config, ownerUser] = await Promise.all([
    db.collection("stores").findOne({ ownerId: new ObjectId(user.id) }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
    db.collection("users").findOne({ _id: new ObjectId(user.id) }, { projection: { state: 1 } }),
  ]);

  if (!store) return NextResponse.json({ products: [], storeName: "", markupPercent: 20, discountCap: 20 });

  const effectiveRule = resolveEffectivePricingRule(
    { markupPercent: config?.markupPercent ?? 20, discountCap: config?.discountCap ?? 20, stateRules: config?.stateRules },
    ownerUser?.state as string | undefined
  );
  const markupPercent: number = effectiveRule.markupPercent;
  const discountCap: number = effectiveRule.discountCap;

  const products = await db
    .collection("store_products")
    .find({ storeId: store._id.toString() })
    .sort({ listedAt: -1 })
    .toArray();

  // Enrich with brand/category/description from global catalog
  const productIds = products
    .map((p) => { try { return new ObjectId(p.productId as string); } catch { return null; } })
    .filter(Boolean) as ObjectId[];

  const catalogDocs = productIds.length
    ? await db.collection("products")
        .find({ _id: { $in: productIds }, brandSuspended: { $ne: true }, isSuspended: { $ne: true } })
        .project({ _id: 1, brand: 1, category: 1, description: 1, allowCustomOrders: 1, adminAdjustedPrice: 1 })
        .toArray()
    : [];

  const catalogMap = new Map(
    (catalogDocs as WithId<Document>[]).map((d) => [d._id.toString(), d])
  );

  const enriched = products
    .filter((p) => catalogMap.has(p.productId as string))
    .map((p) => {
      const cat = catalogMap.get(p.productId as string);
      return {
        ...p,
        brand: (cat?.brand as { name?: string } | undefined)?.name ?? null,
        category: (cat?.category as string | undefined) ?? null,
        description: (cat?.description as string | undefined) ?? null,
        allowCustomOrders: (cat?.allowCustomOrders as boolean | undefined) ?? false,
        adminAdjustedPrice: (cat?.adminAdjustedPrice as number | undefined) ?? null,
      };
    });

  return NextResponse.json({ products: enriched, storeName: store.name, markupPercent, discountCap });
}

// Bulk-apply markup / discount / reset to ALL listed products in this store.
export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const type: "markup" | "discount" | "reset" = body.type;
  const percent: number = Number(body.percent ?? 0);

  if (type !== "markup" && type !== "discount" && type !== "reset") {
    return NextResponse.json({ error: "type must be markup, discount, or reset" }, { status: 400 });
  }
  if (type !== "reset" && (isNaN(percent) || percent < 0)) {
    return NextResponse.json({ error: "percent must be >= 0" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  const storeId = store._id.toString();

  const [config, ownerUser] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
    db.collection("users").findOne({ _id: new ObjectId(user.id) }, { projection: { state: 1 } }),
  ]);
  const effectiveRule = resolveEffectivePricingRule(
    { markupPercent: config?.markupPercent ?? 20, discountCap: config?.discountCap ?? 20, stateRules: config?.stateRules },
    ownerUser?.state as string | undefined
  );
  const markupPercent: number = effectiveRule.markupPercent;
  const discountCap: number = effectiveRule.discountCap;

  if (type === "markup" && percent > markupPercent) {
    return NextResponse.json({ error: `Markup cannot exceed ${markupPercent}% (platform limit).` }, { status: 400 });
  }
  if (type === "discount" && percent > discountCap) {
    return NextResponse.json({ error: `Discount cannot exceed ${discountCap}% (platform limit).` }, { status: 400 });
  }

  const storeProducts = await db
    .collection("store_products")
    .find({ storeId }, { projection: { productId: 1, originalPrice: 1, price: 1 } })
    .toArray();

  if (!storeProducts.length) return NextResponse.json({ ok: true, updatedCount: 0 });

  // adminAdjustedPrice per product is the markup base; variants carry per-variant priceOverride
  const globalIds = storeProducts
    .map((p) => { try { return new ObjectId(p.productId as string); } catch { return null; } })
    .filter(Boolean) as ObjectId[];
  const globalDocs = globalIds.length
    ? await db.collection("products").find({ _id: { $in: globalIds } }).project({ _id: 1, adminAdjustedPrice: 1, price: 1, variants: 1 }).toArray()
    : [];
  const globalMap = new Map(globalDocs.map((d) => [d._id.toString(), d]));

  // Build owner variant prices for a product at a given markup %, based on each
  // variant's catalog priceOverride (which already reflects any admin adjustment).
  function variantPricesForMarkup(gp: Document | undefined, pct: number): Record<string, number> {
    const out: Record<string, number> = {};
    for (const v of (gp?.variants as Array<{ id?: string; priceOverride?: number | null }>) ?? []) {
      if (v.priceOverride != null && v.id != null) {
        out[String(v.id)] = Math.round(Number(v.priceOverride) * (1 + pct / 100) * 100) / 100;
      }
    }
    return out;
  }

  const now = new Date();
  const bulkOps = storeProducts.map((p) => {
    const gp = globalMap.get(p.productId as string);
    const base = (gp?.adminAdjustedPrice as number) ?? (gp?.price as number) ?? (p.originalPrice as number) ?? 0;

    if (type === "reset") {
      // Back to catalog price, no discount, clear custom variant prices
      return {
        updateOne: {
          filter: { storeId, productId: p.productId as string },
          update: { $set: { sellingPrice: null, price: null, discountPercent: 0, isOnSale: false, variantPrices: {}, updatedAt: now } },
        },
      };
    }
    if (type === "markup") {
      const newPrice = Math.round(base * (1 + percent / 100) * 100) / 100;
      const variantPrices = variantPricesForMarkup(gp, percent);
      const setObj: Record<string, unknown> = { sellingPrice: newPrice, price: newPrice, updatedAt: now };
      // Only overwrite variant prices when the product actually has custom-priced variants
      if (Object.keys(variantPrices).length > 0) setObj.variantPrices = variantPrices;
      return {
        updateOne: {
          filter: { storeId, productId: p.productId as string },
          update: { $set: setObj },
        },
      };
    }
    // discount — applied at display time, so it already covers variant prices
    return {
      updateOne: {
        filter: { storeId, productId: p.productId as string },
        update: { $set: { discountPercent: percent, isOnSale: percent > 0, updatedAt: now } },
      },
    };
  });

  const result = await db.collection("store_products").bulkWrite(bulkOps, { ordered: false });
  return NextResponse.json({ ok: true, updatedCount: result.modifiedCount });
}
