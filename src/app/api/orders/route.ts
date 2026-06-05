import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

const CONFIG_ID = "pricing_config";

function orderNumber() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `ORD-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

type CartItem = {
  productId: string;
  storeId: string;
  storeName?: string;
  name?: string;
  sku?: string;
  price?: number;
  mainImage?: string | null;
  quantity: number;
  selectedVariants?: Record<string, string>;
};

function normalizeSelectedVariants(selectedVariants?: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(selectedVariants ?? {})
      .map(([key, value]) => [key.trim().toLowerCase(), value.trim()] as const)
      .filter(([key, value]) => key && value)
  ) as Record<string, string>;
}

// Resolve a shipping address state string to a 2-letter state code
function resolveStateCode(state?: string): string {
  if (!state) return "";
  const s = state.trim();

  // Already a 2-letter code
  if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase();

  // Extract from "Name (CODE)" format
  const paren = s.match(/\(([A-Za-z]{2})\)/);
  if (paren) return paren[1].toUpperCase();

  // Try to match by prefix (e.g. "New York" → NY)
  const NAMES: Record<string, string> = {
    alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR",
    california: "CA", colorado: "CO", connecticut: "CT", delaware: "DE",
    florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
    illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
    kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
    massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
    missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
    oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
    vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
    wisconsin: "WI", wyoming: "WY", "washington d.c.": "DC", "district of columbia": "DC",
  };
  return NAMES[s.toLowerCase()] ?? "";
}

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ObjectId.isValid(user.id)) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const userObjectId = new ObjectId(user.id);

  const orders = await db
    .collection("orders")
    .find({ $or: [{ customerId: user.id }, { customerId: userObjectId }] })
    .sort({ createdAt: -1 })
    .project({ customerEmail: 0 })
    .toArray();

  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Sign in to place an order" }, { status: 401 });

  const { shippingAddress, notes } = await req.json();
  if (!shippingAddress?.fullName || !shippingAddress?.line1 || !shippingAddress?.city) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const cart = await db.collection("carts").findOne({ userId: user.id });
  if (!cart || !cart.items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const userDoc = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user.id) }, { projection: { name: 1, email: 1 } });

  const cartItems = cart.items as CartItem[];
  const invalidItem = cartItems.find((item) => !ObjectId.isValid(item.storeId) || !ObjectId.isValid(item.productId));
  if (invalidItem) {
    return NextResponse.json({ error: "Cart contains an invalid product. Please remove it and try again." }, { status: 400 });
  }

  const productIds = [...new Set(cartItems.map((i) => i.productId))].map((id) => new ObjectId(id));
  const storeIds = [...new Set(cartItems.map((i) => i.storeId))].map((id) => new ObjectId(id));

  // Resolve state code for tax
  const stateCode = resolveStateCode(shippingAddress.state);

  // Fetch everything in parallel
  const [products, stores, storeProductRows, pricingConfig] = await Promise.all([
    db.collection("products").find({ _id: { $in: productIds } }).toArray(),
    db.collection("stores").find({ _id: { $in: storeIds } }).toArray(),
    // Fetch store-specific pricing for all cart items
    db.collection("store_products").find({
      $or: cartItems.map((i) => ({ storeId: i.storeId, productId: i.productId })),
    }).toArray(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
  ]);

  const productById = new Map(products.map((p) => [p._id.toString(), p]));
  const storeById = new Map(stores.map((s) => [s._id.toString(), s]));
  const storeProductByKey = new Map(
    storeProductRows.map((sp) => [`${sp.storeId}:${sp.productId}`, sp])
  );

  // Tax rate for the shipping state
  const taxRate: number =
    pricingConfig?.taxRates?.[stateCode]?.rate ?? 0;

  // Group by store
  const storeMap = new Map<string, { storeName: string; items: (CartItem & { effectivePrice: number; discountAmount: number })[] }>();

  for (const item of cartItems) {
    const store = storeById.get(item.storeId);
    const product = productById.get(item.productId);
    if (!store || !product) {
      return NextResponse.json({ error: "A cart item is no longer available." }, { status: 400 });
    }

    const selectedVariants = normalizeSelectedVariants(item.selectedVariants);
    const matchedVariant = (product.variants ?? []).find((v: Record<string, string>) => {
      if (selectedVariants.size && selectedVariants.size !== (v.size ?? "").toLowerCase()) return false;
      if (selectedVariants.color && selectedVariants.color !== (v.color ?? "").toLowerCase()) return false;
      return true;
    });

    // Resolve effective price from store_products first, then global product
    const storeProd = storeProductByKey.get(`${item.storeId}:${item.productId}`);
    const basePrice = Number(
      matchedVariant?.priceOverride ??
      storeProd?.sellingPrice ??
      storeProd?.price ??
      product.price ??
      item.price ?? 0
    );
    const discountPct: number =
      (storeProd?.isOnSale && (storeProd?.discountPercent ?? 0) > 0)
        ? storeProd.discountPercent
        : 0;
    const effectivePrice = Math.round(basePrice * (1 - discountPct / 100) * 100) / 100;
    const discountAmount = Math.round((basePrice - effectivePrice) * (Number(item.quantity) || 1) * 100) / 100;

    const normalizedItem = {
      productId: item.productId,
      storeId: item.storeId,
      storeName: store.name ?? item.storeName ?? "Store",
      name: product.name ?? item.name ?? "Product",
      sku: matchedVariant?.skuVariant ?? matchedVariant?.sku ?? product.sku ?? item.sku ?? "",
      price: effectivePrice,
      mainImage: product.mainImage ?? item.mainImage ?? product.images?.[0]?.url ?? null,
      quantity: Math.max(1, Number(item.quantity) || 1),
      selectedVariants,
      effectivePrice,
      discountAmount,
    };

    if (!storeMap.has(item.storeId)) {
      storeMap.set(item.storeId, { storeName: normalizedItem.storeName, items: [] });
    }
    storeMap.get(item.storeId)!.items.push(normalizedItem);
  }

  const now = new Date();
  const insertedIds: string[] = [];

  for (const [storeId, { storeName, items }] of storeMap) {
    const subtotal = items.reduce((s, i) => s + i.effectivePrice * i.quantity, 0);
    const totalDiscount = items.reduce((s, i) => s + i.discountAmount, 0);
    const taxAmount = Math.round(subtotal * taxRate / 100 * 100) / 100;
    const total = subtotal + taxAmount;

    const result = await db.collection("orders").insertOne({
      orderNumber: orderNumber(),
      customerId: user.id,
      customerName: userDoc?.name || "Customer",
      customerEmail: userDoc?.email || "",
      storeId,
      storeName,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        price: i.effectivePrice,
        mainImage: i.mainImage ?? null,
        quantity: i.quantity,
        selectedVariants: i.selectedVariants,
      })),
      subtotal,
      shippingFee: 0,
      taxAmount,
      taxRate,
      taxStateCode: stateCode || null,
      discountAmount: totalDiscount,
      total,
      status: "Incoming",
      paymentStatus: "Pending",
      paymentMethod: "Cash on Delivery",
      shippingAddress,
      billingAddress: shippingAddress,
      notes: notes || "",
      createdAt: now,
      updatedAt: now,
    });
    insertedIds.push(result.insertedId.toString());
  }

  await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: [], updatedAt: now } });

  return NextResponse.json({ ok: true, orderIds: insertedIds }, { status: 201 });
}
