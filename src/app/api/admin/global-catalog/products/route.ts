import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { recomputeCatalogCounts } from "../../../../../lib/catalog-counts";

type ProductImageInput = {
  imageUrl: string;
  alt?: string | null;
  isMain?: boolean;
  sortOrder?: number;
};

type ProductVariantInput = {
  id?: string;
  size?: string;
  color?: string;
  sku?: string;
  stock?: number;
  priceOverride?: number | null;
  skuVariant?: string;
  isCustomSize?: boolean;
};

type SizeChartInput = {
  id?: string;
  size: string;
  measurements: Record<string, string>;
  unit: string;
};

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
  images?: ProductImageInput[];
  mainImage?: string | null;
  category?: string;
  categories?: Array<{ category: { name: string; slug?: string }; isPrimary?: boolean }>;
  brand?: { name: string; slug?: string };
  variants?: ProductVariantInput[];
  sizeChart?: SizeChartInput[];
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
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    categories:
      body.categories?.length
        ? body.categories
        : category
        ? [{ isPrimary: true, category: { name: category, slug: slugify(category) } }]
        : [],
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

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(toNumber(searchParams.get("limit"), 100), 500);
    const page = Math.max(toNumber(searchParams.get("page"), 1), 1);
    const skip = (page - 1) * limit;

    const query = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { sku: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
            { "brand.name": { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection("products");
    const [products, total] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({ products, total, page, limit }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/global-catalog/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = (await req.json()) as ProductPayload;
    const product = normalizeProductPayload(body);

    if (!product.name || !product.sku || !product.price) {
      return NextResponse.json({ error: "Name, SKU, and price are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection("products");
    const duplicate = await collection.findOne({ $or: [{ sku: product.sku }, { slug: product.slug }] });
    if (duplicate) {
      return NextResponse.json({ error: "A product with this SKU or slug already exists" }, { status: 409 });
    }

    const result = await collection.insertOne({
      ...product,
      source: "admin",
      createdAt: new Date(),
    });

    await recomputeCatalogCounts(client.db(DB_NAME));

    return NextResponse.json({ product: { ...product, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/global-catalog/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
