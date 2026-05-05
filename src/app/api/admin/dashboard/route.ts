import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(2)}`;
}

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    const [activeStoresCount, totalOrdersCount, revenueAgg, storeRevenueAgg, latestStores] =
      await Promise.all([
        db.collection("stores").countDocuments({ status: "active" }),

        db.collection("orders").countDocuments({}),

        db
          .collection("orders")
          .aggregate([
            { $match: { paymentStatus: "paid" } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totals.total" },
                avgOrderValue: { $avg: "$totals.total" },
              },
            },
          ])
          .toArray(),

        // Top 5 stores by paid order revenue
        db
          .collection("orders")
          .aggregate([
            { $match: { paymentStatus: "paid" } },
            {
              $group: {
                _id: "$storeId",
                revenue: { $sum: "$totals.total" },
                orderCount: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "stores",
                localField: "_id",
                foreignField: "_id",
                as: "store",
              },
            },
            { $unwind: { path: "$store", preserveNullAndEmptyArrays: false } },
            {
              $project: {
                _id: 0,
                name: "$store.name",
                revenue: 1,
                orderCount: 1,
              },
            },
          ])
          .toArray(),

        // 5 most recently created stores with owner info
        db
          .collection("stores")
          .aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "ownerId",
                foreignField: "_id",
                as: "owner",
              },
            },
            { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                name: 1,
                status: 1,
                logoUrl: 1,
                createdAt: 1,
                "owner.name": 1,
                "owner.email": 1,
              },
            },
          ])
          .toArray(),
      ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue ?? 0;
    const avgOrderValue = revenueAgg[0]?.avgOrderValue ?? 0;

    const metrics = [
      {
        label: "Real-time revenue",
        value: formatCurrency(totalRevenue),
        note: "from paid orders",
      },
      {
        label: "Total orders",
        value: totalOrdersCount.toLocaleString(),
        note: "All time orders",
      },
      {
        label: "Active stores",
        value: activeStoresCount.toString(),
        note: "Across all regions",
      },
      {
        label: "Average order value",
        value: `$${avgOrderValue.toFixed(2)}`,
        note: "From paid orders",
      },
    ];

    const maxRevenue = storeRevenueAgg[0]?.revenue || 1;
    const storeMetrics = storeRevenueAgg.map((s) => ({
      name: s.name as string,
      revenue: formatCurrency(s.revenue as number),
      percentage: Math.round(((s.revenue as number) / maxRevenue) * 85),
    }));

    const leaderboard = storeRevenueAgg.slice(0, 3).map((s, i) => ({
      rank: String(i + 1).padStart(2, "0"),
      name: s.name as string,
      volume: formatCurrency(s.revenue as number),
      orderCount: s.orderCount as number,
    }));

    return NextResponse.json(
      { metrics, storeMetrics, leaderboard, latestStores },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
