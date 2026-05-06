import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { getUserFromToken } from "../../../../../../lib/auth";
import { recomputeCatalogCounts } from "../../../../../../lib/catalog-counts";

type ProductPayload = {
  name?: string;
  sku?: string;
  slug?: string;
  description?: string;
  shortDescription?: string | null;
  fullDescription?: string;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock?: number;
  totalStock?: number;
  stockStatus?: string;
  imageUrls?: string[];
  images?: Array<{ imageUrl: string; alt?: string | null; isMain?: boolean; sortOrder?: number }>;
  mainImage?: string | null;
  category?: string;
  categories?: Array<{ category: { name: string; slug?: string }; isPrimary?: boolean }>;
  brand?: { name: string; slug?: string };
  variants?: Array<{ id?: string; size?: string; color?: string; sku?: string; stock?: number; priceOverride?: number | null; skuVariant?: string; isCustomSize?: boolean }>;
  sizeChart?: Array<{ id?: string; size: string; measurements: Record<string, string>; unit: string }>;
  shipping?: {
    weight?: number | null;
    dimensionL?: number | null;
    dimensionW?: number | null;
    dimensionH?: number | null;
    shippingClass?: string | null;
  } | null;
  status?: "active" | "draft" | "archived";
  isFeatured?: boolean;
  isPublished?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tags?: string[];
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeProductPayload(body: ProductPayload) {
  const now = new Date();
  const name = body.name?.trim() ?? "";
  const sku = body.sku?.trim() ?? "";
  const category = body.category?.trim() ?? body.categories?.[0]?.category?.name?.trim() ?? "";
  const imageUrls = Array.from(new Set([...(body.imageUrls ?? []), ...(body.images ?? []).map((image) => image.imageUrl)].filter(Boolean)));
  const images =
    body.images?.length
      ? body.images.map((image, index) => ({
          imageUrl: image.imageUrl,
          alt: image.alt ?? name,
          isMain: image.isMain ?? index === 0,
          sortOrder: image.sortOrder ?? index,
          createdAt: now,
        }))
      : imageUrls.map((imageUrl, index) => ({
          imageUrl,
          alt: name,
          isMain: index === 0,
          sortOrder: index,
          createdAt: now,
        }));
  const price = toNumber(body.price);
  const totalStock = toNumber(body.totalStock ?? body.stock);
  const isPublished = body.isPublished ?? body.status === "active";

  return {
    name,
    sku,
    slug: slugify(body.slug || name || sku),
    description: body.description?.trim() || body.fullDescription?.trim() || body.shortDescription?.trim() || "",
    shortDescription: body.shortDescription ?? null,
    fullDescription: body.fullDescription?.trim() || body.description?.trim() || "",
    price,
    compareAtPrice: body.compareAtPrice == null ? null : toNumber(body.compareAtPrice),
    costPrice: body.costPrice == null ? null : toNumber(body.costPrice),
    stock: totalStock,
    totalStock,
    stockStatus: body.stockStatus || (totalStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK"),
    imageUrls,
    images,
    mainImage: body.mainImage ?? imageUrls[0] ?? null,
    category,
    categories: body.categories?.length ? body.categories : category ? [{ isPrimary: true, category: { name: category, slug: slugify(category) } }] : [],
    brand: body.brand?.name ? { name: body.brand.name.trim(), slug: body.brand.slug || slugify(body.brand.name) } : undefined,
    variants: (body.variants ?? []).map((variant, index) => ({
      id: variant.id || `${Date.now()}-${index}`,
      size: variant.size || "",
      color: variant.color || undefined,
      sku: variant.sku || variant.skuVariant || `${sku || "SKU"}-${index + 1}`,
      stock: toNumber(variant.stock),
      priceOverride: variant.priceOverride == null ? null : toNumber(variant.priceOverride),
      stockQuantity: toNumber(variant.stock),
      skuVariant: variant.skuVariant || variant.sku || `${sku || "SKU"}-${index + 1}`,
      isCustomSize: variant.isCustomSize ?? false,
    })),
    sizeChart: body.sizeChart ?? [],
    shipping: body.shipping ?? null,
    status: body.status || (isPublished ? "active" : "draft"),
    isFeatured: body.isFeatured ?? false,
    isPublished,
    seoTitle: body.seoTitle ?? null,
    seoDescription: body.seoDescription ?? null,
    tags: body.tags ?? [],
    updatedAt: now,
  };
}

async function requireAdmin() {
  const tokenUser = await getUserFromToken();
  if (!tokenUser) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (tokenUser.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { tokenUser };
}

function getObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const objectId = getObjectId(id);
    if (!objectId) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

    const client = await clientPromise;
    const product = await client.db(DB_NAME).collection("products").findOne({ _id: objectId });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/global-catalog/products/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const objectId = getObjectId(id);
    if (!objectId) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

    const body = (await req.json()) as ProductPayload;
    const product = normalizeProductPayload(body);
    if (!product.name || !product.sku || !product.price) {
      return NextResponse.json({ error: "Name, SKU, and price are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection("products");
    const duplicate = await collection.findOne({
      _id: { $ne: objectId },
      $or: [{ sku: product.sku }, { slug: product.slug }],
    });
    if (duplicate) {
      return NextResponse.json({ error: "A product with this SKU or slug already exists" }, { status: 409 });
    }

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: product },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await recomputeCatalogCounts(client.db(DB_NAME));

    return NextResponse.json({ product: result }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/global-catalog/products/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const objectId = getObjectId(id);
    if (!objectId) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection("products").deleteOne({ _id: objectId });
    if (!result.deletedCount) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await recomputeCatalogCounts(db);

    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/global-catalog/products/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
