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
  const [product, store] = await Promise.all([
    db.collection("products").findOne({ _id: new ObjectId(productId) }),
    db.collection("stores").findOne({ _id: new ObjectId(storeId) }),
  ]);

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const normalizedSelectedVariants = normalizeSelectedVariants(selectedVariants);
  const matchedVariant = findMatchingVariant(product as ProductDoc, normalizedSelectedVariants);
  const variantSnapshot = matchedVariant
    ? Object.fromEntries(
        Object.entries({ size: matchedVariant.size, color: matchedVariant.color })
          .filter(([, value]) => value)
          .map(([key, value]) => [key, String(value)])
      )
    : normalizedSelectedVariants;
  const derivedPrice = Number(matchedVariant?.priceOverride ?? product.price ?? price ?? 0);
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
      await db.collection("carts").updateOne(
        { userId: user.id },
        { $inc: { [`items.${idx}.quantity`]: normalizedItem.quantity as number }, $set: { updatedAt: now } }
      );
    } else {
      await db.collection("carts").updateOne(
        { userId: user.id },
        { $push: { items: normalizedItem as never }, $set: { updatedAt: now } }
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, storeId, quantity, selectedVariants } = await req.json();
  if (!productId || !storeId || quantity == null) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const cart = await db.collection("carts").findOne({ userId: user.id });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  const itemKey = selectedVariantsKey(selectedVariants);
  const idx = cart.items.findIndex((i: { productId: string; storeId: string; selectedVariants?: SelectedVariants }) =>
    i.productId === productId &&
    i.storeId === storeId &&
    selectedVariantsKey(i.selectedVariants) === itemKey
  );
  if (idx < 0) return NextResponse.json({ error: "Item not in cart" }, { status: 404 });

  if (quantity <= 0) {
    const newItems = cart.items.filter((_: unknown, i: number) => i !== idx);
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: newItems, updatedAt: new Date() } });
  } else {
    await db.collection("carts").updateOne(
      { userId: user.id },
      { $set: { [`items.${idx}.quantity`]: quantity, updatedAt: new Date() } }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, storeId, clearAll, selectedVariants } = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (clearAll) {
    await db.collection("carts").updateOne({ userId: user.id }, { $set: { items: [], updatedAt: new Date() } });
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
