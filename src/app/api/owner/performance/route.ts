import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

type OrderDoc = {
  storeId?: string | ObjectId;
  total?: number;
  subtotal?: number;
  totals?: { total?: number; subtotal?: number };
  status?: string;
  items?: Array<{ productId?: string; quantity?: number; price?: number }>;
  createdAt?: Date | string;
};

type StoreProductDoc = {
  productId: string;
  name?: string;
  sku?: string;
  price?: number;
  mainImage?: string | null;
  quantity?: number;
};

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function startOfDay(d: Date)   { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addDays(d: Date, n: number)   { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function addWeeks(d: Date, n: number)  { return addDays(d, n * 7); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function addYears(d: Date, n: number)  { return new Date(d.getFullYear() + n, 0, 1); }
function mondayOf(d: Date) { const dow = d.getDay(); return addDays(startOfDay(d), dow === 0 ? -6 : 1 - dow); }
function fmtDate(d: Date)  { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtMonth(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }

function totalOf(order: OrderDoc) {
  return Number(order.total ?? order.totals?.total ?? order.subtotal ?? order.totals?.subtotal ?? 0);
}
function isCompleted(order: OrderDoc) {
  return !["Rejected","cancelled","Cancelled"].includes(order.status ?? "");
}
function percentChange(a: number, b: number) {
  if (!b && !a) return 0;
  if (!b) return 100;
  return Math.round(((a - b) / b) * 100);
}

export async function GET(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const period = (req.nextUrl.searchParams.get("period") ?? "monthly") as
    "daily" | "weekly" | "monthly" | "yearly";
  const now = new Date();

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) {
    return NextResponse.json({
      storeName: "My Store",
      periodLabel: "This Period",
      metrics: null,
      revenueBars: [],
      visitsLine: [],
      products: [],
    });
  }

  const storeId = store._id.toString();

  // ── Period bounds ──────────────────────────────────────────────────────────
  let curStart: Date, curEnd: Date, prevStart: Date, prevEnd: Date, periodLabel: string;
  switch (period) {
    case "daily":
      curStart  = startOfDay(now);
      curEnd    = addDays(curStart, 1);
      prevStart = addDays(curStart, -1);
      prevEnd   = curStart;
      periodLabel = "Today";
      break;
    case "weekly":
      curStart  = mondayOf(now);
      curEnd    = addWeeks(curStart, 1);
      prevStart = addWeeks(curStart, -1);
      prevEnd   = curStart;
      periodLabel = "This Week";
      break;
    case "yearly":
      curStart  = new Date(now.getFullYear(), 0, 1);
      curEnd    = addYears(curStart, 1);
      prevStart = addYears(curStart, -1);
      prevEnd   = curStart;
      periodLabel = "This Year";
      break;
    default: // monthly
      curStart  = startOfMonth(now);
      curEnd    = addMonths(curStart, 1);
      prevStart = addMonths(curStart, -1);
      prevEnd   = curStart;
      periodLabel = "This Month";
  }

  // ── Revenue bar definitions ───────────────────────────────────────────────
  type BarDef = { start: Date; end: Date; label: string };
  let barDefs: BarDef[];
  switch (period) {
    case "daily":
      barDefs = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(startOfDay(now), -(6 - i));
        return { start: d, end: addDays(d, 1), label: d.toLocaleDateString("en-US", { weekday: "short" }) };
      });
      break;
    case "weekly":
      barDefs = Array.from({ length: 6 }, (_, i) => {
        const wk = addWeeks(mondayOf(now), -(5 - i));
        return { start: wk, end: addWeeks(wk, 1), label: wk.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
      });
      break;
    case "yearly":
      barDefs = Array.from({ length: 5 }, (_, i) => {
        const yr = now.getFullYear() - 4 + i;
        return { start: new Date(yr, 0, 1), end: new Date(yr + 1, 0, 1), label: String(yr) };
      });
      break;
    default: // monthly
      barDefs = Array.from({ length: 6 }, (_, i) => {
        const m = addMonths(startOfMonth(now), -(5 - i));
        return { start: m, end: addMonths(m, 1), label: MONTH_LABELS[m.getMonth()] };
      });
  }

  // ── Visits line definitions ──────────────────────────────────────────────
  type LineDef = { key: string; label: string; start: Date };
  let lineDefs: LineDef[];
  let lineGroupFormat: string;

  if (period === "yearly") {
    lineGroupFormat = "%Y-%m";
    lineDefs = Array.from({ length: 12 }, (_, i) => {
      const m = addMonths(startOfMonth(now), -(11 - i));
      return { key: fmtMonth(m), label: MONTH_LABELS[m.getMonth()], start: m };
    });
  } else {
    lineGroupFormat = "%Y-%m-%d";
    lineDefs = Array.from({ length: 8 }, (_, i) => {
      const d = addDays(startOfDay(now), -(7 - i));
      return { key: fmtDate(d), label: d.toLocaleDateString("en-US", { weekday: "short" }), start: d };
    });
  }
  const lineStart = lineDefs[0].start;
  const lineEnd   = period === "yearly"
    ? addMonths(lineDefs[lineDefs.length - 1].start, 1)
    : addDays(lineDefs[lineDefs.length - 1].start, 1);

  // ── Single wide query window covering bars + both periods + line ───────────
  const allDates = [barDefs[0].start, prevStart, lineStart, barDefs[barDefs.length-1].end, curEnd, lineEnd];
  const qStart = new Date(Math.min(...allDates.map(d => d.getTime())));
  const qEnd   = new Date(Math.max(...allDates.map(d => d.getTime())));

  const [orders, products, curVisits, prevVisits, productViews, visitsByUnit, referralAppsInRange, allReferralApps] = await Promise.all([
    db.collection<OrderDoc>("orders")
      .find({ $or: [{ storeId }, { storeId: store._id }], createdAt: { $gte: qStart, $lt: qEnd } })
      .toArray(),
    db.collection<StoreProductDoc>("store_products").find({ storeId }).sort({ listedAt: -1 }).toArray(),
    db.collection("store_visits").countDocuments({ storeId, createdAt: { $gte: curStart, $lt: curEnd } }),
    db.collection("store_visits").countDocuments({ storeId, createdAt: { $gte: prevStart, $lt: prevEnd } }),
    db.collection("product_views").aggregate<{ _id: string; views: number }>([
      { $match: { storeId, createdAt: { $gte: curStart, $lt: curEnd } } },
      { $group: { _id: "$productId", views: { $sum: 1 } } },
    ]).toArray(),
    db.collection("store_visits").aggregate<{ _id: string; visits: number }>([
      { $match: { storeId, createdAt: { $gte: lineStart, $lt: lineEnd } } },
      { $group: { _id: { $dateToString: { format: lineGroupFormat, date: "$createdAt" } }, visits: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray(),
    db.collection("store_applications")
      .find({ ownerId: new ObjectId(user.id), status: "approved_by_admin", referralBonusPaid: true, reviewedAt: { $gte: qStart, $lt: qEnd } })
      .toArray(),
    db.collection("store_applications")
      .find({ ownerId: new ObjectId(user.id), status: "approved_by_admin", referralBonusPaid: true })
      .sort({ reviewedAt: -1 })
      .toArray(),
  ]);

  // ── Metrics for current vs previous period ────────────────────────────────
  const inRange = (o: OrderDoc, s: Date, e: Date) => {
    const d = o.createdAt ? new Date(o.createdAt) : null;
    return d !== null && d >= s && d < e && isCompleted(o);
  };
  const curOrders  = orders.filter(o => inRange(o, curStart, curEnd));
  const prevOrders = orders.filter(o => inRange(o, prevStart, prevEnd));

  const inReviewedRange = (a: { reviewedAt?: unknown }, s: Date, e: Date) => {
    const d = a.reviewedAt ? new Date(a.reviewedAt as string | Date) : null;
    return d !== null && d >= s && d < e;
  };
  const REFERRAL_BONUS = 100;

  const curReferralCount  = referralAppsInRange.filter(a => inReviewedRange(a as { reviewedAt?: unknown }, curStart, curEnd)).length;
  const prevReferralCount = referralAppsInRange.filter(a => inReviewedRange(a as { reviewedAt?: unknown }, prevStart, prevEnd)).length;

  const curRevenue  = curOrders.reduce((s, o) => s + totalOf(o), 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + totalOf(o), 0);
  const curUnits    = curOrders.reduce((s, o) => s + (o.items ?? []).reduce((is, item) => is + Number(item.quantity ?? 0), 0), 0);

  const pvMap      = new Map(productViews.map(v => [v._id, v.views]));
  const totalViews = [...pvMap.values()].reduce((s, v) => s + v, 0);
  const convRate     = totalViews ? Math.round((curUnits / totalViews) * 100) : 0;
  const prevConvRate = prevVisits  ? Math.round((prevOrders.length / prevVisits) * 100) : 0;

  // ── Revenue bars ──────────────────────────────────────────────────────────
  const revenueBars = barDefs.map(({ start, end, label }) => ({
    label,
    value: orders.filter(o => inRange(o, start, end)).reduce((s, o) => s + totalOf(o), 0),
  }));

  // ── Visits sparkline ──────────────────────────────────────────────────────
  const visitMap  = new Map(visitsByUnit.map(v => [v._id, v.visits]));
  const visitsLine = lineDefs.map(({ key, label }) => ({ label, value: visitMap.get(key) ?? 0 }));

  // ── Product performance table ─────────────────────────────────────────────
  const salesMap = new Map<string, { units: number; revenue: number }>();
  for (const o of curOrders) {
    for (const item of o.items ?? []) {
      if (!item.productId) continue;
      const cur = salesMap.get(item.productId) ?? { units: 0, revenue: 0 };
      cur.units   += Number(item.quantity ?? 0);
      cur.revenue += Number(item.price ?? 0) * Number(item.quantity ?? 0);
      salesMap.set(item.productId, cur);
    }
  }

  const productRows = products.map(p => {
    const sales = salesMap.get(p.productId) ?? { units: 0, revenue: 0 };
    const views  = pvMap.get(p.productId) ?? 0;
    return {
      productId:   p.productId,
      name:        p.name ?? "Product",
      sku:         p.sku ?? "",
      price:       Number(p.price ?? 0),
      image:       p.mainImage ?? null,
      stock:       Number(p.quantity ?? 0),
      sales:       sales.units,
      revenue:     sales.revenue,
      engagements: views,
      conversions: views ? Math.round((sales.units / views) * 100) : 0,
    };
  });

  const referralEarnings = allReferralApps.map((a: any) => ({
    id:            a._id.toString(),
    applicantName: a.applicant?.name ?? "Applicant",
    applicantEmail: a.applicant?.email ?? "",
    storeName:     a.storeName ?? "",
    approvedAt:    a.reviewedAt ? new Date(a.reviewedAt).toISOString() : null,
    amount:        REFERRAL_BONUS,
  }));

  return NextResponse.json({
    storeName:   store.name ?? "My Store",
    periodLabel,
    metrics: {
      revenue:              curRevenue,
      revenueChange:        percentChange(curRevenue, prevRevenue),
      referralEarnings:     curReferralCount * REFERRAL_BONUS,
      referralEarningsChange: percentChange(curReferralCount, prevReferralCount),
      visits:               curVisits,
      visitsChange:         percentChange(curVisits, prevVisits),
      conversionRate:       convRate,
      conversionChange:     convRate - prevConvRate,
      orders:               curOrders.length,
      unitsSold:            curUnits,
    },
    revenueBars,
    visitsLine,
    products: productRows,
    referralEarnings,
    totalReferralEarnings: allReferralApps.length * REFERRAL_BONUS,
  });
}
