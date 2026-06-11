import type { Db } from "mongodb";

/** How many top stores get a leaderboard rank tag. Stores outside this get no tag. */
export const RANK_TAG_LIMIT = 10;

/**
 * Compute a store's position in the revenue leaderboard (paid orders, highest first).
 * Returns a 1-based rank if the store is within the top {@link RANK_TAG_LIMIT},
 * otherwise null (store not ranked / outside the top N / no paid orders).
 *
 * storeId in the orders collection may be stored as a string or an ObjectId, so the
 * grouping key is normalised with $toString to keep a single store's revenue together.
 */
export async function getStoreRank(db: Db, storeId: string): Promise<number | null> {
  const ranking = await db
    .collection("orders")
    .aggregate<{ _id: string; revenue: number }>([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: { $toString: "$storeId" }, revenue: { $sum: "$total" } } },
      { $sort: { revenue: -1 } },
      { $limit: RANK_TAG_LIMIT },
    ])
    .toArray();

  const idx = ranking.findIndex((r) => r._id === storeId && r.revenue > 0);
  return idx === -1 ? null : idx + 1;
}
