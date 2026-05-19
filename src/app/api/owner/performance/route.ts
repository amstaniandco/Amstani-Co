import { NextResponse } from "next/server";
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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function totalOf(order: OrderDoc) {
  return Number(order.total ?? order.totals?.total ?? order.subtotal ?? order.totals?.subtotal ?? 0);
}

function isCompleted(order: OrderDoc) {
  return !["Rejected", "cancelled", "Cancelled"].includes(order.status ?? "");
}

function percentChange(current: number, previous: number) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) {
    return NextResponse.json({
      storeName: "My Store",
      metrics: null,
      revenueBars: [],
      visitsLine: [],
      products: [],
    });
  }

  const storeId = store._id.toString();
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = addMonths(currentMonthStart, -1);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const sixMonthsStart = addMonths(currentMonthStart, -5);
  const eightDaysStart = new Date(now);
  eightDaysStart.setDate(now.getDate() - 7);
  eightDaysStart.setHours(0, 0, 0, 0);

  const [orders, products, currentVisits, previousVisits, productViews] = await Promise.all([
    db
      .collection<OrderDoc>("orders")
      .find({ $or: [{ storeId }, { storeId: store._id }] })
      .toArray(),
    db.collection<StoreProductDoc>("store_products").find({ storeId }).sort({ listedAt: -1 }).toArray(),
    db.collection("store_visits").countDocuments({ storeId, createdAt: { $gte: currentMonthStart, $lt: nextMonthStart } }),
    db.collection("store_visits").countDocuments({ storeId, createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } }),
    db
      .collection("product_views")
      .aggregate<{ _id: string; views: number }>([
        { $match: { storeId, createdAt: { $gte: currentMonthStart, $lt: nextMonthStart } } },
        { $group: { _id: "$productId", views: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const currentOrders = orders.filter((order) => {
    const createdAt = order.createdAt ? new Date(order.createdAt) : null;
    return createdAt && createdAt >= currentMonthStart && createdAt < nextMonthStart && isCompleted(order);
  });
  const previousOrders = orders.filter((order) => {
    const createdAt = order.createdAt ? new Date(order.createdAt) : null;
    return createdAt && createdAt >= previousMonthStart && createdAt < currentMonthStart && isCompleted(order);
  });

  const currentRevenue = currentOrders.reduce((sum, order) => sum + totalOf(order), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + totalOf(order), 0);
  const currentUnits = currentOrders.reduce(
    (sum, order) => sum + (order.items ?? []).reduce((itemSum, item) => itemSum + Number(item.quantity ?? 0), 0),
    0,
  );
  const productViewMap = new Map(productViews.map((view) => [view._id, view.views]));
  const totalProductViews = [...productViewMap.values()].reduce((sum, views) => sum + views, 0);
  const conversionRate = totalProductViews ? Math.round((currentUnits / totalProductViews) * 100) : 0;
  const previousConversionRate = previousVisits ? Math.round((previousOrders.length / previousVisits) * 100) : 0;

  const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
    const monthStart = addMonths(sixMonthsStart, index);
    const monthEnd = addMonths(monthStart, 1);
    const revenue = orders
      .filter((order) => {
        const createdAt = order.createdAt ? new Date(order.createdAt) : null;
        return createdAt && createdAt >= monthStart && createdAt < monthEnd && isCompleted(order);
      })
      .reduce((sum, order) => sum + totalOf(order), 0);

    return {
      label: MONTH_LABELS[monthStart.getMonth()],
      value: revenue,
    };
  });

  const visitsByDay = await db
    .collection("store_visits")
    .aggregate<{ _id: string; visits: number }>([
      { $match: { storeId, createdAt: { $gte: eightDaysStart } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, visits: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();
  const visitsDayMap = new Map(visitsByDay.map((day) => [day._id, day.visits]));
  const visitsLine = Array.from({ length: 8 }, (_, index) => {
    const day = new Date(eightDaysStart);
    day.setDate(eightDaysStart.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    return {
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      value: visitsDayMap.get(key) ?? 0,
    };
  });

  const salesByProduct = new Map<string, { units: number; revenue: number }>();
  for (const order of currentOrders) {
    for (const item of order.items ?? []) {
      if (!item.productId) continue;
      const current = salesByProduct.get(item.productId) ?? { units: 0, revenue: 0 };
      current.units += Number(item.quantity ?? 0);
      current.revenue += Number(item.price ?? 0) * Number(item.quantity ?? 0);
      salesByProduct.set(item.productId, current);
    }
  }

  const productRows = products.map((product) => {
    const sales = salesByProduct.get(product.productId) ?? { units: 0, revenue: 0 };
    const engagements = productViewMap.get(product.productId) ?? 0;
    return {
      productId: product.productId,
      name: product.name ?? "Product",
      sku: product.sku ?? "",
      price: Number(product.price ?? 0),
      image: product.mainImage ?? null,
      stock: Number(product.quantity ?? 0),
      sales: sales.units,
      revenue: sales.revenue,
      engagements,
      conversions: engagements ? Math.round((sales.units / engagements) * 100) : 0,
    };
  });

  return NextResponse.json({
    storeName: store.name ?? "My Store",
    metrics: {
      revenue: currentRevenue,
      revenueChange: percentChange(currentRevenue, previousRevenue),
      visits: currentVisits,
      visitsChange: percentChange(currentVisits, previousVisits),
      conversionRate,
      conversionChange: conversionRate - previousConversionRate,
      orders: currentOrders.length,
      unitsSold: currentUnits,
    },
    revenueBars: revenueByMonth,
    visitsLine,
    products: productRows,
  });
}
