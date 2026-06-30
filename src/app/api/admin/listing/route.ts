import { NextResponse } from "next/server";
import { Pool } from "pg";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { requireAdminResponse } from "../../../../lib/admin-catalog-taxonomy";

export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  productId: string | null;          // Supabase product UUID (== global sourceProductId)
  productName: string | null;
  size: string | null;
  color: string | null;
  // Enriched from the global catalog (null when the product isn't in our catalog):
  globalProductId: string | null;    // MongoDB _id — the id store_products listings use
  sku: string | null;
  image: string | null;
  brand: string | null;
  category: string | null;
};

export type StoreMatch = { storeId: string; storeName: string } | null;

export type ListingOrder = {
  id: string;
  status: string | null;
  fulfillmentStatus: string | null;
  total: number;
  currency: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  estimatedDelivery: string | null;

  // Person who made the order
  userId: string | null;
  customerEmail: string | null;
  customerPhone: string | null;

  // Fulfilment
  carrier: string | null;
  trackingNumber: string | null;
  orderNotes: string | null;
  shippingFirstName: string | null;
  shippingLastName: string | null;
  shippingCompany: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;

  items: OrderItem[];
  // The store owned by the customer (matched by email) — where "List" will list to.
  store: StoreMatch;
  // True when every listable product of this order is already in the store.
  alreadyListed: boolean;
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function openPool() {
  const SUPABASE_DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
  if (!SUPABASE_DATABASE_URL) return null;
  return new Pool({
    connectionString: SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

// Resolve the store owned by the user whose email matches `email` (case-insensitive).
// Returns null when no such user / store exists.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveStoreForEmail(db: any, email: string): Promise<StoreMatch> {
  const clean = (email ?? "").trim();
  if (!clean) return null;
  const user = await db
    .collection("users")
    .findOne(
      { email: { $regex: `^${escapeRegex(clean)}$`, $options: "i" } },
      { projection: { _id: 1 } }
    );
  if (!user) return null;
  const store = await db
    .collection("stores")
    .findOne({ ownerId: user._id }, { projection: { name: 1 } });
  if (!store) return null;
  return { storeId: store._id.toString(), storeName: store.name as string };
}

// ── GET: orders (person + products + fulfilment), read-only from Supabase ────
export async function GET() {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const pool = openPool();
    if (!pool) {
      return NextResponse.json(
        { error: "SUPABASE_DATABASE_URL is not configured" },
        { status: 500 }
      );
    }

    let orders: Record<string, unknown>[];
    let items: Record<string, unknown>[];
    try {
      const [o, i] = await Promise.all([
        pool.query(`SELECT * FROM orders ORDER BY "createdAt" DESC`),
        pool.query(`SELECT * FROM order_items`),
      ]);
      orders = o.rows;
      items = i.rows;
    } finally {
      await pool.end().catch(() => {});
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Enrich every line item with full catalog detail (image, sku, brand,
    // category) and the global product _id used for listing.
    const sourceIds = Array.from(
      new Set(items.map((it) => it.productId as string).filter(Boolean))
    );
    const globalProducts = sourceIds.length
      ? await db
          .collection("products")
          .find({ sourceProductId: { $in: sourceIds } })
          .project({ _id: 1, sourceProductId: 1, sku: 1, mainImage: 1, imageUrls: 1, brand: 1, category: 1 })
          .toArray()
      : [];
    const gpBySource = new Map(globalProducts.map((p) => [p.sourceProductId as string, p]));

    const itemsByOrder: Record<string, OrderItem[]> = {};
    for (const it of items) {
      const orderId = it.orderId as string;
      const gp = gpBySource.get(it.productId as string);
      if (!itemsByOrder[orderId]) itemsByOrder[orderId] = [];
      itemsByOrder[orderId].push({
        id: it.id as string,
        quantity: (it.quantity as number) ?? 0,
        price: (it.price as number) ?? 0,
        productId: (it.productId as string) ?? null,
        productName: (it.productName as string) ?? null,
        size: (it.size as string) ?? null,
        color: (it.color as string) ?? null,
        globalProductId: gp ? (gp._id as ObjectId).toString() : null,
        sku: gp ? ((gp.sku as string) ?? null) : null,
        image: gp ? (((gp.mainImage as string) ?? (gp.imageUrls as string[] | undefined)?.[0]) ?? null) : null,
        brand: gp ? (((gp.brand as { name?: string } | null)?.name) ?? null) : null,
        category: gp ? ((gp.category as string) ?? null) : null,
      });
    }

    // Resolve the target store for each distinct customer email once.
    const emails = Array.from(
      new Set(orders.map((o) => (o.customerEmail as string) ?? "").filter(Boolean))
    );
    const storeByEmail = new Map<string, StoreMatch>();
    for (const em of emails) {
      storeByEmail.set(em.toLowerCase(), await resolveStoreForEmail(db, em));
    }

    const result: ListingOrder[] = orders.map((o) => ({
      id: o.id as string,
      status: (o.status as string) ?? null,
      fulfillmentStatus: (o.fulfillmentStatus as string) ?? null,
      total: (o.total as number) ?? 0,
      currency: (o.currency as string) ?? null,
      createdAt: (o.createdAt as string) ?? null,
      updatedAt: (o.updatedAt as string) ?? null,
      paidAt: (o.paidAt as string) ?? null,
      shippedAt: (o.shippedAt as string) ?? null,
      estimatedDelivery: (o.estimatedDelivery as string) ?? null,
      userId: (o.userId as string) ?? null,
      customerEmail: (o.customerEmail as string) ?? null,
      customerPhone: (o.customerPhone as string) ?? null,
      carrier: (o.carrier as string) ?? null,
      trackingNumber: (o.trackingNumber as string) ?? null,
      orderNotes: (o.orderNotes as string) ?? null,
      shippingFirstName: (o.shippingFirstName as string) ?? null,
      shippingLastName: (o.shippingLastName as string) ?? null,
      shippingCompany: (o.shippingCompany as string) ?? null,
      shippingAddressLine1: (o.shippingAddressLine1 as string) ?? null,
      shippingAddressLine2: (o.shippingAddressLine2 as string) ?? null,
      shippingCity: (o.shippingCity as string) ?? null,
      shippingState: (o.shippingState as string) ?? null,
      shippingPostalCode: (o.shippingPostalCode as string) ?? null,
      shippingCountry: (o.shippingCountry as string) ?? null,
      items: itemsByOrder[o.id as string] ?? [],
      store: storeByEmail.get(((o.customerEmail as string) ?? "").toLowerCase()) ?? null,
      alreadyListed: false,
    }));

    // Flag orders that have already been listed (tracked per-order, so two
    // orders sharing the same product don't both show as listed). Persists
    // across reloads via the order_listings collection.
    const orderIds = result.map((o) => o.id);
    const listedDocs = await db
      .collection("order_listings")
      .find({ _id: { $in: orderIds as unknown as never[] } })
      .toArray();
    const listedSet = new Set(listedDocs.map((d) => d._id as unknown as string));
    for (const o of result) o.alreadyListed = listedSet.has(o.id);

    return NextResponse.json({ orders: result, count: result.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("GET /api/admin/listing error:", message);
    return NextResponse.json(
      { error: "Failed to fetch orders", detail: message },
      { status: 500 }
    );
  }
}

// ── POST: list an order's products into the customer's store ─────────────────
// Body: { email: string, items: Array<{ productId: string /* supabase uuid */, quantity: number }> }
// The store is resolved from the email; products are mapped supabase-uuid →
// global product, then upserted into store_products with the ordered quantity.
export async function POST(req: Request) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const body = await req.json().catch(() => ({}));
    const email: string = body.email ?? "";
    const orderId: string = body.orderId ?? "";
    const rawItems: Array<{ productId: string; quantity: number }> = Array.isArray(body.items) ? body.items : [];

    if (!email.trim()) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }
    if (rawItems.length === 0) {
      return NextResponse.json({ error: "No items to list" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await resolveStoreForEmail(db, email);
    if (!store) {
      return NextResponse.json(
        { error: `No store is owned by ${email}. The order's email must match a store owner.` },
        { status: 404 }
      );
    }

    // Map each Supabase product UUID → its global catalog product.
    const sourceIds = Array.from(new Set(rawItems.map((i) => i.productId).filter(Boolean)));
    const globalProducts = await db
      .collection("products")
      .find({ sourceProductId: { $in: sourceIds } })
      .toArray();
    const gpBySource = new Map(globalProducts.map((p) => [p.sourceProductId as string, p]));

    const now = new Date();
    const ops = [];
    const skipped: string[] = [];

    for (const item of rawItems) {
      const product = gpBySource.get(item.productId);
      if (!product) {
        skipped.push(item.productId);
        continue;
      }
      const globalId = product._id.toString();
      const originalPrice = Number(product.price ?? 0);
      ops.push({
        updateOne: {
          filter: { storeId: store.storeId, productId: globalId },
          update: {
            $set: {
              storeId: store.storeId,
              productId: globalId,
              name: product.name,
              sku: product.sku ?? "",
              originalPrice,
              price: originalPrice,
              mainImage: product.mainImage ?? null,
              quantity: Number(item.quantity) || 1,
              updatedAt: now,
            },
            $setOnInsert: {
              listedAt: now,
              sellingPrice: null,
              discountPercent: 0,
              isOnSale: false,
              isNewArrival: false,
            },
          },
          upsert: true,
        },
      });
    }

    let listed = 0;
    if (ops.length > 0) {
      const res = await db.collection("store_products").bulkWrite(ops, { ordered: false });
      listed = res.upsertedCount + res.modifiedCount;

      // Record that THIS order has been listed so the UI can hide its button,
      // independently of other orders that may share the same product.
      if (orderId) {
        await db.collection("order_listings").updateOne(
          { _id: orderId as unknown as never },
          {
            $set: {
              storeId: store.storeId,
              storeName: store.storeName,
              productIds: ops.map((op) => op.updateOne.filter.productId),
              listedAt: now,
            },
          },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      storeId: store.storeId,
      storeName: store.storeName,
      listed: ops.length,
      updated: listed,
      skipped: skipped.length,
      message:
        `Listed ${ops.length} product${ops.length === 1 ? "" : "s"} into "${store.storeName}".` +
        (skipped.length ? ` ${skipped.length} skipped (not found in global catalog).` : ""),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("POST /api/admin/listing error:", message);
    return NextResponse.json(
      { error: "Failed to list products", detail: message },
      { status: 500 }
    );
  }
}
