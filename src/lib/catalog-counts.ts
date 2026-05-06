import type { Db } from "mongodb";

export async function recomputeCatalogCounts(db: Db) {
  const products = db.collection("products");
  const brands = db.collection("brands");
  const categories = db.collection("categories");

  // Zero out all counts first so deleted products are reflected
  await Promise.all([
    brands.updateMany({}, { $set: { productCount: 0 } }),
    categories.updateMany({}, { $set: { productCount: 0 } }),
  ]);

  const [brandCounts, categoryCounts] = await Promise.all([
    products.aggregate([
      { $match: { "brand.name": { $exists: true, $ne: null } } },
      { $group: { _id: "$brand.name", count: { $sum: 1 } } },
    ]).toArray(),
    products.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories.category.name", count: { $sum: 1 } } },
    ]).toArray(),
  ]);

  await Promise.all([
    brandCounts.length > 0
      ? brands.bulkWrite(
          brandCounts.map(({ _id, count }) => ({
            updateOne: { filter: { name: _id }, update: { $set: { productCount: count } } },
          })),
          { ordered: false }
        )
      : Promise.resolve(),
    categoryCounts.length > 0
      ? categories.bulkWrite(
          categoryCounts.map(({ _id, count }) => ({
            updateOne: { filter: { name: _id }, update: { $set: { productCount: count } } },
          })),
          { ordered: false }
        )
      : Promise.resolve(),
  ]);
}
