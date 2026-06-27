import type { Db } from "mongodb";

// Single document in catalog_settings tracks the currently applied bulk
// adjustment so it can be re-applied after a Supabase sync and shown in the UI.
export const ADJUSTMENT_SETTINGS_ID = "global_price_adjustment";

export type AdjustmentType = "increase" | "decrease";

export type StoredAdjustment = {
  type: AdjustmentType | null;
  percent: number;
  updatedAt: string | null;
};

type Variant = Record<string, unknown> & {
  priceOverride?: number | null;
  basePriceOverride?: number | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

// Only published/active products participate — skip drafts, archived, and
// suspended brands/products.
const ELIGIBLE_PRODUCTS_FILTER = {
  price: { $exists: true, $gt: 0 },
  isPublished: { $ne: false },
  status: { $nin: ["archived", "draft"] },
  brandSuspended: { $ne: true },
  isSuspended: { $ne: true },
} as const;

// Reads the currently persisted bulk adjustment (or "none").
export async function getStoredAdjustment(db: Db): Promise<StoredAdjustment> {
  const doc = await db
    .collection("catalog_settings")
    .findOne({ _id: ADJUSTMENT_SETTINGS_ID as unknown as never });

  return {
    type: (doc?.type as AdjustmentType | null) ?? null,
    percent: typeof doc?.percent === "number" ? doc.percent : 0,
    updatedAt: doc?.updatedAt ?? null,
  };
}

// Persists the current adjustment so the admin UI can display it and the sync
// can re-apply it. Each apply is computed from the original price (not
// cumulative), so the last applied value IS the current state.
export async function saveStoredAdjustment(
  db: Db,
  type: AdjustmentType,
  percent: number
): Promise<void> {
  await db.collection("catalog_settings").updateOne(
    { _id: ADJUSTMENT_SETTINGS_ID as unknown as never },
    { $set: { type, percent, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

// Clears the persisted adjustment (used by reset).
export async function clearStoredAdjustment(db: Db): Promise<void> {
  await db
    .collection("catalog_settings")
    .deleteOne({ _id: ADJUSTMENT_SETTINGS_ID as unknown as never });
}

// Re-scale any per-variant custom prices (priceOverride) by the same factor.
// The untouched original is kept in basePriceOverride so reset can restore it.
function adjustVariants(variants: Variant[] | undefined, factor: number): Variant[] {
  if (!Array.isArray(variants)) return [];
  return variants.map((v) => {
    if (v.priceOverride == null && v.basePriceOverride == null) return v;
    const original = v.basePriceOverride ?? v.priceOverride ?? 0;
    // strip basePriceOverride; rebuild explicitly
    const rest: Variant = { ...v };
    delete rest.basePriceOverride;
    return {
      ...rest,
      basePriceOverride: round2(Number(original)),
      priceOverride: round2(Number(original) * factor),
    };
  });
}

// Apply a percentage to every eligible product's adminAdjustedPrice.
// - increase: adminAdjustedPrice = price * (1 + percent/100)
// - decrease: adminAdjustedPrice = price * (1 - percent/100)
// Computed from the original `price` each time (not cumulative). The original
// `price` (wholesale) is always preserved. Returns the number of products touched.
export async function applyAdjustmentToProducts(
  db: Db,
  type: AdjustmentType,
  percent: number
): Promise<number> {
  const products = await db
    .collection("products")
    .find(ELIGIBLE_PRODUCTS_FILTER)
    .project({ _id: 1, price: 1, variants: 1 })
    .toArray();

  if (!products.length) return 0;

  const factor = type === "increase" ? 1 + percent / 100 : 1 - percent / 100;

  const bulkOps = products.map((p) => {
    const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
    const variants = adjustVariants(p.variants as Variant[] | undefined, factor);
    const adminAdjustedPrice = round2((Number(p.price) || 0) * factor);
    return {
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: { adminAdjustedPrice, ...(hasVariants ? { variants } : {}) },
        },
      },
    };
  });

  await db.collection("products").bulkWrite(bulkOps, { ordered: false });

  // Clear non-customized store_products.sellingPrice so the new base price flows
  // through. (sellingPrice within ±1 cent of originalPrice = auto-set at
  // listing, not manually changed.)
  const storePriceOps = products.map((p) => ({
    updateMany: {
      filter: {
        productId: p._id.toString(),
        $expr: {
          $lt: [{ $abs: { $subtract: ["$sellingPrice", "$originalPrice"] } }, 0.02],
        },
      },
      update: { $set: { sellingPrice: null } },
    },
  }));
  if (storePriceOps.length) {
    await db.collection("store_products").bulkWrite(storePriceOps, { ordered: false });
  }

  return products.length;
}

// Removes the adjustment from every product, restoring original prices.
// Returns the number of products modified.
export async function resetAdjustment(db: Db): Promise<number> {
  const products = await db
    .collection("products")
    .find({ price: { $exists: true, $gt: 0 } })
    .project({ _id: 1, variants: 1 })
    .toArray();

  if (!products.length) return 0;

  const round = round2;
  const bulkOps = products.map((p) => {
    const variants = Array.isArray(p.variants) ? (p.variants as Variant[]) : [];
    const hasVariants = variants.length > 0;
    const restored = variants.map((v) => {
      if (v.priceOverride == null && v.basePriceOverride == null) return v;
      const original = v.basePriceOverride ?? v.priceOverride ?? 0;
      const rest: Variant = { ...v };
      delete rest.basePriceOverride;
      return { ...rest, priceOverride: round(Number(original)) };
    });
    return {
      updateOne: {
        filter: { _id: p._id },
        update: {
          $unset: { adminAdjustedPrice: "" },
          ...(hasVariants ? { $set: { variants: restored } } : {}),
        },
      },
    };
  });

  const result = await db.collection("products").bulkWrite(bulkOps, { ordered: false });
  return result.modifiedCount;
}

// Re-applies the currently persisted adjustment (if any) to all eligible
// products. Used after a Supabase sync so new/updated products instantly inherit
// the admin's markup. No-op when no adjustment is stored.
export async function reapplyStoredAdjustment(db: Db): Promise<number> {
  const stored = await getStoredAdjustment(db);
  if (!stored.type || stored.percent <= 0) return 0;
  return applyAdjustmentToProducts(db, stored.type, stored.percent);
}
