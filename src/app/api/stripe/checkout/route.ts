import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import stripe, { STRIPE_CURRENCY } from "../../../../lib/stripe";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

const CONFIG_ID = "pricing_config";

function resolveStateCode(state?: string): string {
  if (!state) return "";
  const s = state.trim();
  if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase();
  const paren = s.match(/\(([A-Za-z]{2})\)/);
  if (paren) return paren[1].toUpperCase();
  const NAMES: Record<string, string> = {
    alabama:"AL",alaska:"AK",arizona:"AZ",arkansas:"AR",california:"CA",colorado:"CO",
    connecticut:"CT",delaware:"DE",florida:"FL",georgia:"GA",hawaii:"HI",idaho:"ID",
    illinois:"IL",indiana:"IN",iowa:"IA",kansas:"KS",kentucky:"KY",louisiana:"LA",
    maine:"ME",maryland:"MD",massachusetts:"MA",michigan:"MI",minnesota:"MN",
    mississippi:"MS",missouri:"MO",montana:"MT",nebraska:"NE",nevada:"NV",
    "new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY",
    "north carolina":"NC","north dakota":"ND",ohio:"OH",oklahoma:"OK",oregon:"OR",
    pennsylvania:"PA","rhode island":"RI","south carolina":"SC","south dakota":"SD",
    tennessee:"TN",texas:"TX",utah:"UT",vermont:"VT",virginia:"VA",washington:"WA",
    "west virginia":"WV",wisconsin:"WI",wyoming:"WY","washington d.c.":"DC",
  };
  return NAMES[s.toLowerCase()] ?? "";
}

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

function normalizeVariants(selectedVariants?: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(selectedVariants ?? {})
      .map(([k, v]) => [k.trim().toLowerCase(), v.trim()] as const)
      .filter(([k, v]) => k && v)
  ) as Record<string, string>;
}

// POST /api/stripe/checkout
// 1. Validates the cart
// 2. Creates one MongoDB order per store (paymentStatus: "Pending")
// 3. Creates a Stripe PaymentIntent for the full cart total
// 4. Clears the cart
// 5. Returns { clientSecret, orderIds, total }
export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Sign in to checkout" }, { status: 401 });

  const { shippingAddress, notes } = await req.json();
  if (!shippingAddress?.fullName || !shippingAddress?.line1 || !shippingAddress?.city) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const cart = await db.collection("carts").findOne({ userId: user.id });
  if (!cart?.items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const userDoc = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user.id) }, { projection: { name: 1, email: 1 } });

  const cartItems = cart.items as CartItem[];
  const invalidItem = cartItems.find((i) => !ObjectId.isValid(i.storeId) || !ObjectId.isValid(i.productId));
  if (invalidItem) {
    return NextResponse.json({ error: "Cart contains an invalid item. Remove it and try again." }, { status: 400 });
  }

  const productIds = [...new Set(cartItems.map((i) => i.productId))].map((id) => new ObjectId(id));
  const storeIds = [...new Set(cartItems.map((i) => i.storeId))].map((id) => new ObjectId(id));
  const stateCode = resolveStateCode(shippingAddress.state);

  const [products, stores, storeProductRows, pricingConfig] = await Promise.all([
    db.collection("products").find({ _id: { $in: productIds } }).toArray(),
    db.collection("stores").find({ _id: { $in: storeIds } }).toArray(),
    db.collection("store_products").find({
      $or: cartItems.map((i) => ({ storeId: i.storeId, productId: i.productId })),
    }).toArray(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
  ]);

  const productById = new Map(products.map((p) => [p._id.toString(), p]));
  const storeById = new Map(stores.map((s) => [s._id.toString(), s]));
  const storeProductByKey = new Map(storeProductRows.map((sp) => [`${sp.storeId}:${sp.productId}`, sp]));
  const taxRate: number = pricingConfig?.taxRates?.[stateCode]?.rate ?? 0;

  type ResolvedItem = CartItem & { effectivePrice: number; discountAmount: number };

  // Group items by store
  const storeMap = new Map<string, { storeName: string; stripeAccountId: string | null; items: ResolvedItem[] }>();
  for (const item of cartItems) {
    const store = storeById.get(item.storeId);
    const product = productById.get(item.productId);
    if (!store || !product) {
      return NextResponse.json({ error: "A cart item is no longer available." }, { status: 400 });
    }

    const selectedVariants = normalizeVariants(item.selectedVariants);
    const matchedVariant = (product.variants ?? []).find((v: Record<string, string>) => {
      if (selectedVariants.size && selectedVariants.size !== (v.size?.trim().toLowerCase() ?? "")) return false;
      if (selectedVariants.color && selectedVariants.color !== (v.color?.trim().toLowerCase() ?? "")) return false;
      return true;
    });

    const storeProd = storeProductByKey.get(`${item.storeId}:${item.productId}`);
    const basePrice = Number(
      matchedVariant?.priceOverride ??
      storeProd?.sellingPrice ??
      storeProd?.price ??
      product.price ??
      item.price ?? 0
    );
    const discountPct: number =
      storeProd?.isOnSale && (storeProd?.discountPercent ?? 0) > 0 ? storeProd.discountPercent : 0;
    const effectivePrice = Math.round(basePrice * (1 - discountPct / 100) * 100) / 100;
    const qty = Math.max(1, Number(item.quantity) || 1);

    const resolvedItem: ResolvedItem = {
      productId: item.productId,
      storeId: item.storeId,
      storeName: store.name ?? item.storeName ?? "Store",
      name: product.name ?? item.name ?? "Product",
      sku: matchedVariant?.skuVariant ?? matchedVariant?.sku ?? product.sku ?? item.sku ?? "",
      price: effectivePrice,
      mainImage: product.mainImage ?? item.mainImage ?? null,
      quantity: qty,
      selectedVariants,
      effectivePrice,
      discountAmount: Math.round((basePrice - effectivePrice) * qty * 100) / 100,
    };

    if (!storeMap.has(item.storeId)) {
      storeMap.set(item.storeId, {
        storeName: resolvedItem.storeName || "Store",
        stripeAccountId: (store.stripeAccountId as string) || null,
        items: [],
      });
    }
    storeMap.get(item.storeId)!.items.push(resolvedItem);
  }

  const now = new Date();
  const orderIds: string[] = [];
  const storeBreakdown: { storeId: string; orderId: string; stripeAccountId: string | null; transferAmount: number }[] = [];
  let totalCents = 0;
  let totalSubtotalCents = 0;
  let totalTaxCents = 0;
  let totalDiscountCents = 0;

  // Insert one order per store, all paymentStatus: "Pending"
  for (const [storeId, { storeName, stripeAccountId, items }] of storeMap) {
    const subtotal = items.reduce((s, i) => s + i.effectivePrice * i.quantity, 0);
    const totalDiscount = items.reduce((s, i) => s + i.discountAmount, 0);
    const taxAmount = Math.round(subtotal * taxRate / 100 * 100) / 100;
    const storeTotal = subtotal + taxAmount;
    const storeCents = Math.round(storeTotal * 100);
    totalCents += storeCents;
    totalSubtotalCents += Math.round(subtotal * 100);
    totalTaxCents += Math.round(taxAmount * 100);
    totalDiscountCents += Math.round(totalDiscount * 100);

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
      total: storeTotal,
      status: "Incoming",
      paymentStatus: "Pending",
      paymentMethod: "Card",
      shippingAddress,
      billingAddress: shippingAddress,
      notes: notes || "",
      createdAt: now,
      updatedAt: now,
    });

    const orderId = result.insertedId.toString();
    orderIds.push(orderId);
    storeBreakdown.push({ storeId, orderId, stripeAccountId, transferAmount: storeCents });
  }

  if (totalCents < 50) {
    return NextResponse.json(
      { error: `Order total is too low (Rs ${(totalCents / 100).toFixed(0)}). Make sure your products have prices set.` },
      { status: 400 }
    );
  }

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        customerId: user.id,
        orderIds: JSON.stringify(orderIds),
        storeBreakdown: JSON.stringify(storeBreakdown),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment setup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Clear cart now that orders are created
  await db.collection("carts").updateOne(
    { userId: user.id },
    { $set: { items: [], updatedAt: now } }
  );

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderIds,
    total: totalCents / 100,
    subtotal: totalSubtotalCents / 100,
    taxAmount: totalTaxCents / 100,
    discountAmount: totalDiscountCents / 100,
    taxRate,
    taxStateCode: stateCode || null,
    currency: STRIPE_CURRENCY,
  });
}
