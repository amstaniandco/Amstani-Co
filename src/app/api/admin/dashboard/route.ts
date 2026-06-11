import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const stateFilter = searchParams.get("state")?.trim();

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // ── State revenue query (triggered when map state is selected) ─────────
    if (stateFilter) {
      const result = await db.collection("orders").aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            "shippingAddress.state": { $regex: `^${stateFilter}$`, $options: "i" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            orderCount: { $sum: 1 },
          },
        },
      ]).toArray();

      return NextResponse.json({
        state: stateFilter,
        revenue: result[0]?.revenue ?? 0,
        orderCount: result[0]?.orderCount ?? 0,
        formatted: formatCurrency(result[0]?.revenue ?? 0),
      });
    }

    // ── Full dashboard data ────────────────────────────────────────────────
    const [activeStoresCount, totalOrdersCount, revenueAgg, storeRevenueAgg, latestStores, allStateRevenues] =
      await Promise.all([

        db.collection("stores").countDocuments({ status: "active" }),

        db.collection("orders").countDocuments({}),

        // Total revenue + avg order value from paid orders
        db.collection("orders").aggregate([
          { $match: { paymentStatus: "Paid" } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$total" },
              avgOrderValue: { $avg: "$total" },
            },
          },
        ]).toArray(),

        // Top stores by revenue — use pipeline lookup to handle string storeId vs ObjectId _id
        db.collection("orders").aggregate([
          { $match: { paymentStatus: "Paid" } },
          {
            $group: {
              _id: "$storeId",
              storeName: { $first: "$storeName" },
              revenue: { $sum: "$total" },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 50 },
          // Try to join with stores collection — storeId in orders may be string or ObjectId
          {
            $lookup: {
              from: "stores",
              let: { sid: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ["$$sid", { $toString: "$_id" }] },
                        { $eq: [{ $toObjectId: "$$sid" }, "$_id"] },
                      ],
                    },
                  },
                },
              ],
              as: "storeDoc",
            },
          },
          {
            $project: {
              _id: 0,
              // Use storeName from order (always available), fallback to store doc
              name: {
                $ifNull: [
                  { $arrayElemAt: ["$storeDoc.name", 0] },
                  "$storeName",
                  "Unknown Store",
                ],
              },
              revenue: 1,
              orderCount: 1,
            },
          },
        ]).toArray(),

        // 5 most recently created stores with owner info
        db.collection("stores").aggregate([
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
        ]).toArray(),

        // Revenue for every state (for map hover tooltips)
        db.collection("orders").aggregate([
          { $match: { paymentStatus: "Paid", "shippingAddress.state": { $exists: true, $ne: "" } } },
          {
            $group: {
              _id: "$shippingAddress.state",
              revenue: { $sum: "$total" },
              orderCount: { $sum: 1 },
            },
          },
        ]).toArray(),
      ]);

    const totalRevenue  = revenueAgg[0]?.totalRevenue  ?? 0;
    const avgOrderValue = revenueAgg[0]?.avgOrderValue ?? 0;

    const metrics = [
      { label: "Total Revenue",       value: formatCurrency(totalRevenue), note: "from paid orders" },
      { label: "Total Orders",        value: totalOrdersCount.toLocaleString(), note: "All time" },
      { label: "Active Stores",       value: activeStoresCount.toString(), note: "Across all regions" },
      { label: "Avg Order Value",     value: formatCurrency(avgOrderValue), note: "From paid orders" },
    ];

    const maxRevenue = (storeRevenueAgg[0]?.revenue as number) || 1;
    const storeMetrics = storeRevenueAgg.map((s) => ({
      name:       (s.name as string) || "Unknown",
      revenue:    formatCurrency(s.revenue as number),
      percentage: Math.round(((s.revenue as number) / maxRevenue) * 85),
    }));

    const leaderboard = storeRevenueAgg.map((s, i) => ({
      rank:       String(i + 1).padStart(2, "0"),
      name:       (s.name as string) || "Unknown",
      volume:     formatCurrency(s.revenue as number),
      orderCount: s.orderCount as number,
    }));

    // Build state revenue lookup map { "California": { revenue: 1234, formatted: "$1.2K", orderCount: 5 } }
    const stateRevenueMap: Record<string, { revenue: number; formatted: string; orderCount: number }> = {};
    for (const s of allStateRevenues) {
      if (s._id) {
        stateRevenueMap[s._id] = {
          revenue: s.revenue,
          formatted: formatCurrency(s.revenue),
          orderCount: s.orderCount,
        };
      }
    }

    return NextResponse.json({ metrics, storeMetrics, leaderboard, latestStores, stateRevenueMap });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
