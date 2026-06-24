import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { requireAdminResponse } from "../../../../lib/admin-catalog-taxonomy";

// Supported time ranges for the dashboard filter. Maps a range key to the
// number of days to look back; "all" applies no date filter.
const RANGE_DAYS: Record<string, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  year: 365,
};

// Builds a createdAt date filter for the given range key. Returns {} for "all"
// or any unknown key, so the aggregation covers every order.
function dateMatch(range: string | null): Record<string, unknown> {
  if (!range || range === "all") return {};
  const days = RANGE_DAYS[range];
  if (!days) return {};
  const since = new Date();
  since.setDate(since.getDate() - days);
  return { createdAt: { $gte: since } };
}

// GET /api/admin/finance-stock?range=all|today|7d|30d|90d|year
// Returns finance summary for the admin dashboard:
//   - summary stats (total revenue, orders, paid, pending)
//   - revenue by US state (from paid orders' shipping addresses)
//   - top stores by revenue
export async function GET(req: Request) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const range = new URL(req.url).searchParams.get("range");
    const dateFilter = dateMatch(range);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const orders = db.collection("orders");

    const [summary, byState, byStore] = await Promise.all([

      // ── Summary stats ──────────────────────────────────────────────────────
      orders.aggregate([
        { $match: { ...dateFilter } },
        {
          $group: {
            _id: null,
            totalRevenue:  { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$total", 0] } },
            totalOrders:   { $sum: 1 },
            paidOrders:    { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] } },
            pendingOrders: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0] } },
          },
        },
      ]).toArray(),

      // ── Revenue by state ───────────────────────────────────────────────────
      orders.aggregate([
        { $match: { ...dateFilter, paymentStatus: "Paid", "shippingAddress.state": { $exists: true, $ne: "" } } },
        {
          $group: {
            _id: "$shippingAddress.state",
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, state: "$_id", revenue: 1 } },
      ]).toArray(),

      // ── Top stores by revenue ──────────────────────────────────────────────
      orders.aggregate([
        { $match: { ...dateFilter, paymentStatus: "Paid" } },
        {
          $group: {
            _id: "$storeId",
            storeName: { $first: "$storeName" },
            revenue: { $sum: "$total" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 6 },
        { $project: { _id: 0, storeName: 1, revenue: 1, orderCount: 1 } },
      ]).toArray(),
    ]);

    const stats = summary[0] ?? { totalRevenue: 0, totalOrders: 0, paidOrders: 0, pendingOrders: 0 };

    // Normalise revenue by state for the bar chart
    const maxRevenue = byState[0]?.revenue ?? 1;
    const revenueByState = byState.map((s) => ({
      state: s.state,
      value: s.revenue >= 1_000_000
        ? `$${(s.revenue / 1_000_000).toFixed(1)}M`
        : `$${(s.revenue / 1_000).toFixed(0)}K`,
      barHeight: Math.round((s.revenue / maxRevenue) * 48),
      revenue: s.revenue,
    }));

    // Store revenues with trend placeholder (no historical data yet)
    const storeRevenues = byStore.map((s) => ({
      name: s.storeName || "Unknown Store",
      sales: `${s.orderCount} ${s.orderCount === 1 ? "Sale" : "Sales"}`,
      amount: `$${Number(s.revenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      revenue: s.revenue,
    }));

    return NextResponse.json({
      summary: {
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        paidOrders: stats.paidOrders,
        pendingOrders: stats.pendingOrders,
      },
      revenueByState,
      storeRevenues,
    });
  } catch (error) {
    console.error("GET /api/admin/finance-stock error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
