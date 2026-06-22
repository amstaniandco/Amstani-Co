import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

type SelectedVariants = Record<string, string>;

type CartItemInput = {
  productId: string;
  storeId: string;
  storeName?: string;
  name?: string;
  sku?: string;
  price?: number;
  mainImage?: string | null;
  quantity?: number;
  selectedVariants?: SelectedVariants;
  customOrderDetails?: { description: string; mediaUrls: string[] };
};

type ProductVariant = {
  id?: string;
  size?: string;
  color?: string;
  sku?: string;
  skuVariant?: string;
  priceOverride?: number | null;
};

type ProductDoc = {
  name?: string;
  sku?: string;
  price?: number;
  mainImage?: string | null;
  images?: Array<string | { url?: string; imageUrl?: string }>;
  variants?: ProductVariant[];
};

function normalizeSelectedVariants(selectedVariants?: SelectedVariants) {
  const entries = Object.entries(selectedVariants ?? {})
    .map(([key, value]) => [key.trim().toLowerCase(), value.trim()] as const)
    .filter(([key, value]) => key && value);

  return Object.fromEntries(entries) as SelectedVariants;
}

function selectedVariantsKey(selectedVariants?: SelectedVariants) {
  const normalized = normalizeSelectedVariants(selectedVariants);
  return JSON.stringify(Object.keys(normalized).sort().reduce<SelectedVariants>((acc, key) => {
    acc[key] = normalized[key];
    return acc;
  }, {}));
}

function variantMatches(selectedVariants: SelectedVariants, variant: ProductVariant) {
  const normalizedVariant = {
    size: variant.size?.trim().toLowerCase() ?? "",
    color: variant.color?.trim().toLowerCase() ?? "",
    sku: variant.sku?.trim().toLowerCase() ?? "",
    skuVariant: variant.skuVariant?.trim().toLowerCase() ?? "",
  };

  return Object.entries(selectedVariants).every(([key, value]) => {
    const needle = value.trim().toLowerCase();
    if (key === "size") return normalizedVariant.size === needle;
    if (key === "color") return normalizedVariant.color === needle;
    if (key === "sku" || key === "skuvariant") return normalizedVariant.sku === needle || normalizedVariant.skuVariant === needle;
    return true;
  });
}

function findMatchingVariant(product: ProductDoc, selectedVariants: SelectedVariants) {
  const variants = product.variants ?? [];
  if (!variants.length) return null;

  const normalized = normalizeSelectedVariants(selectedVariants);
  if (!Object.keys(normalized).length) {
    return variants.length === 1 ? variants[0] : null;
  }

  return variants.find((variant) => variantMatches(normalized, variant)) ?? null;
}

async function getUser() {
  const user = await getUserFromToken();
  if (!user) return null;
  return user;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ items: [] });

  const client = await clientPromise;
  const cart = await client.db(DB_NAME).collection("carts").findOne({ userId: user.id });
  return NextResponse.json({ items: cart?.items ?? [] });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in to use cart" }, { status: 401 });

  const {
    productId,
    storeId,
    storeName,
    name,
    sku,
    price,
    mainImage,
    quantity = 1,
    selectedVariants,
    customOrderDetails,
  }: CartItemInput = await req.json();
  if (!productId || !storeId) return NextResponse.json({ error: "productId and storeId required" }, { status: 400 });
  if (!ObjectId.isValid(productId) || !ObjectId.isValid(storeId)) {
    return NextResponse.json({ error: "Invalid product or store" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const now = new Date();
  const [product, store, storeProd] = await Promise.all([
    db.collection("products").findOne({ _id: new ObjectId(productId) }),
    db.collection("stores").findOne({ _id: new ObjectId(storeId) }),
    db.collection("store_products").findOne(
      { storeId, productId },
      { projection: { quantity: 1, sellingPrice: 1, discountPercent: 1, isOnSale: 1, variantPrices: 1 } }
    ),
  ]);

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const availableStock: number = storeProd?.quantity ?? Infinity;
  if (availableStock <= 0) {
    return NextResponse.json({ error: "This product is out of stock." }, { status: 400 });
  }

  const normalizedSelectedVariants = normalizeSelectedVariants(selectedVariants);
  const matchedVariant = findMatchingVariant(product as ProductDoc, normalizedSelectedVariants);
  const variantSnapshot = matchedVariant
    ? Object.fromEntries(
        Object.entries({ size: matchedVariant.size, color: matchedVariant.color })
          .filter(([, value]) => value)
          .map(([key, value]) => [key, String(value)])
      )
    : normalizedSelectedVariants;

  // Resolve the effective price server-side (never trust raw client price for variant overrides)
  const storeVariantPrices: Record<string, number> = (storeProd?.variantPrices as Record<string, number>) ?? {};
  const storeDiscount: number = (storeProd?.isOnSale && (storeProd?.discountPercent ?? 0) > 0)
    ? (storeProd.discountPercent as number) : 0;
  // Per-store variant price takes precedence over catalog priceOverride
  const variantBasePrice: number | null =
    matchedVariant?.id && storeVariantPrices[matchedVariant.id] != null
      ? storeVariantPrices[matchedVariant.id]
      : matchedVariant?.priceOverride ?? null;
  // Final raw price before discount
  const rawPrice: number = Number(variantBasePrice ?? storeProd?.sellingPrice ?? product.price ?? price ?? 0);
  // Apply store discount
  const derivedPrice = Math.round(rawPrice * (1 - storeDiscount / 100) * 100) / 100;

  const derivedSku = matchedVariant?.skuVariant ?? matchedVariant?.sku ?? product.sku ?? sku ?? "";
  const derivedImage = product.mainImage ?? mainImage ?? product.images?.[0]?.url ?? product.images?.[0]?.imageUrl ?? product.images?.[0] ?? null;

  const normalizedItem: Record<string, unknown> = {
    productId,
    storeId,
    storeName: store.name ?? storeName ?? "Store",
    name: product.name ?? name ?? "Product",
    sku: derivedSku,
    price: derivedPrice,
    mainImage: derivedImage,
    quantity: Math.max(1, Number(quantity) || 1),
    selectedVariants: variantSnapshot,
    addedAt: now,
  };
  if (customOrderDetails?.description) {
    normalizedItem.customOrderDetails = {
      description: customOrderDetails.description,
      mediaUrls: Array.isArray(customOrderDetails.mediaUrls) ? customOrderDetails.mediaUrls : [],
    };
  }

  const cart = await db.collection("carts").findOne({ userId: user.id });
  const itemKey = selectedVariantsKey(normalizedItem.selectedVariants as SelectedVariants);

  if (!cart) {
    await db.collection("carts").insertOne({
      userId: user.id,
      items: [normalizedItem],
      updatedAt: now,
    });
  } else {
    // Custom order items always get their own cart row (never merge)
    const idx = customOrderDetails?.description
      ? -1
      : cart.items.findIndex((i: { productId: string; storeId: string; selectedVariants?: SelectedVariants }) =>
          i.productId === productId &&
          i.storeId === storeId &&
          selectedVariantsKey(i.selectedVariants) === itemKey
        );
    if (idx >= 0) {
      const currentQty: number = cart.items[idx].quantity ?? 0;
      const addQty = normalizedItem.quantity as number;
      const newQty = Math.min(currentQty + addQty, availableStock);
      if (newQty <= currentQty) {
        return NextResponse.json({ error: `Only ${availableStock} unit(s) available. You already have ${currentQty} in your cart.` }, { status: 400 });
      }
      await db.collection("carts").updateOne(
        { userId: user.id },
        { $set: { [`items.${idx}.quantity`]: newQty, updatedAt: now } }
      );
    } else {
      const addQty = Math.min(normalizedItem.quantity as number, availableStock);
      await db.collection("carts").updateOne(
        { userId: user.id },
        { $push: { items: { ...normalizedItem, quantity: addQty } as never }, $set: { updatedAt: now } }
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, storeId, quantity, selectedVariants, itemIndex } = await req.json();
  if (quantity == null) return NextResponse.json({ error: "Missing quantity" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const cart = await db.collection("carts").findOne({ userId: user.id });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  let idx: number;
  if (typeof itemIndex === "number" && itemIndex >= 0) {
    idx = itemIndex;
  } else {
    if (!productId || !storeId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const itemKey = selectedVariantsKey(selectedVariants);
    idx = cart.items.findIndex((i: { productId: string; storeId: string; selectedVariants?: SelectedVariants }) =>
      i.productId === productId &&
      i.storeId === storeId &&
      selectedVariantsKey(i.selectedVariants) === itemKey
    );
  }
  if (idx < 0) return NextResponse.json({ error: "Item not in cart" }, { status: 404 });

  if (quantity <= 0) {
    const newItems = cart.items.filter((_: unknown, i: number) => i !== idx);
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: newItems, updatedAt: new Date() } });
  } else {
    // Cap against available stock
    const item = cart.items[idx];
    const sp = await db.collection("store_products").findOne(
      { storeId: item.storeId, productId: item.productId },
      { projection: { quantity: 1 } }
    );
    const available: number = sp?.quantity ?? Infinity;
    const capped = Math.min(quantity, available);
    await db.collection("carts").updateOne(
      { userId: user.id },
      { $set: { [`items.${idx}.quantity`]: capped, updatedAt: new Date() } }
    );
    if (capped < quantity) {
      return NextResponse.json({ ok: true, capped: true, max: available });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, storeId, clearAll, selectedVariants, itemIndex } = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (clearAll) {
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: [], updatedAt: new Date() } });
  } else if (typeof itemIndex === "number" && itemIndex >= 0) {
    const cart = await db.collection("carts").findOne({ userId: user.id });
    if (!cart) return NextResponse.json({ ok: true });
    const newItems = cart.items.filter((_: unknown, i: number) => i !== itemIndex);
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: newItems, updatedAt: new Date() } });
  } else {
    const cart = await db.collection("carts").findOne({ userId: user.id });
    if (!cart) return NextResponse.json({ ok: true });
    const itemKey = selectedVariantsKey(selectedVariants);
    const newItems = cart.items.filter((i: { productId: string; storeId: string; selectedVariants?: SelectedVariants }) =>
      !(i.productId === productId && i.storeId === storeId && selectedVariantsKey(i.selectedVariants) === itemKey)
    );
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: newItems, updatedAt: new Date() } });
  }

  return NextResponse.json({ ok: true });
}
