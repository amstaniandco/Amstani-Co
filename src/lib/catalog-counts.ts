import type { Db } from "mongodb";

export async function recomputeCatalogCounts(db: Db): Promise<{ brandCount: number; categoryCount: number }> {
  const products = db.collection("products");
  const brands = db.collection("brands");
  const categories = db.collection("categories");

  await Promise.all([
    brands.updateMany({}, { $set: { productCount: 0 } }),
    categories.updateMany({}, { $set: { productCount: 0 } }),
  ]);

  // ── Brands ──────────────────────────────────────────────────────────────────
  // Supabase products store brand.id (UUID). Admin products have no brand.id.
  const [supabaseBrandCounts, adminBrandCounts] = await Promise.all([
    products.aggregate<{ _id: string; count: number }>([
      { $match: { "brand.id": { $exists: true, $ne: null } } },
      { $group: { _id: "$brand.id", count: { $sum: 1 } } },
    ]).toArray(),
    products.aggregate<{ _id: string; count: number }>([
      { $match: { "brand.id": { $exists: false }, "brand.name": { $exists: true, $ne: null } } },
      { $group: { _id: "$brand.name", count: { $sum: 1 } } },
    ]).toArray(),
  ]);

  // Match Supabase brands by sourceBrandId ↔ brand.id
  if (supabaseBrandCounts.length > 0) {
    await brands.bulkWrite(
      supabaseBrandCounts.map(({ _id, count }) => ({
        updateOne: { filter: { sourceBrandId: _id }, update: { $set: { productCount: count } } },
      })),
      { ordered: false }
    );
  }

  // Match admin-created brands by name (only those without a sourceBrandId)
  if (adminBrandCounts.length > 0) {
    await brands.bulkWrite(
      adminBrandCounts.map(({ _id, count }) => ({
        updateOne: {
          filter: { name: _id, sourceBrandId: { $exists: false } },
          update: { $set: { productCount: count } },
        },
      })),
      { ordered: false }
    );
  }

  // ── Categories ──────────────────────────────────────────────────────────────
  // Supabase products store categories[].categoryId. Admin products do not.
  const [supabaseCatCounts, adminCatCounts] = await Promise.all([
    products.aggregate<{ _id: string; count: number }>([
      { $unwind: "$categories" },
      { $match: { "categories.categoryId": { $exists: true, $ne: null } } },
      { $group: { _id: "$categories.categoryId", count: { $sum: 1 } } },
    ]).toArray(),
    products.aggregate<{ _id: string; count: number }>([
      { $unwind: "$categories" },
      { $match: { "categories.categoryId": { $exists: false }, "categories.category.name": { $exists: true, $ne: null } } },
      { $group: { _id: "$categories.category.name", count: { $sum: 1 } } },
    ]).toArray(),
  ]);

  if (supabaseCatCounts.length > 0) {
    await categories.bulkWrite(
      supabaseCatCounts.map(({ _id, count }) => ({
        updateOne: { filter: { sourceCategoryId: _id }, update: { $set: { productCount: count } } },
      })),
      { ordered: false }
    );
  }

  if (adminCatCounts.length > 0) {
    await categories.bulkWrite(
      adminCatCounts.map(({ _id, count }) => ({
        updateOne: {
          filter: { name: _id, sourceCategoryId: { $exists: false } },
          update: { $set: { productCount: count } },
        },
      })),
      { ordered: false }
    );
  }

  return {
    brandCount: supabaseBrandCounts.length + adminBrandCounts.length,
    categoryCount: supabaseCatCounts.length + adminCatCounts.length,
  };
}
