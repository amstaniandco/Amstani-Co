import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../lib/db";

export const dynamic = "force-dynamic";

function getImage(product: Record<string, unknown>): string | null {
  const images = Array.isArray(product.images) ? product.images : [];
  for (const image of images) {
    const url =
      typeof image === "string"
        ? image
        : image && typeof image === "object"
          ? (image as { imageUrl?: string; url?: string }).imageUrl ??
            (image as { url?: string }).url
          : null;
    if (url) return url;
  }
  return typeof product.mainImage === "string" ? product.mainImage : null;
}

export async function GET() {
  try {
    const db = (await clientPromise).db(DB_NAME);
    const [products, brands, categories] = await Promise.all([
      db
        .collection("products")
        .find({
          status: "active",
          isPublished: { $ne: false },
          isSuspended: { $ne: true },
          brandSuspended: { $ne: true },
        })
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(60)
        .project({
          name: 1,
          brand: 1,
          category: 1,
          categories: 1,
          imageUrls: 1,
          images: 1,
          mainImage: 1,
          price: 1,
          adminAdjustedPrice: 1,
        })
        .toArray(),
      db.collection("brands").find({}).sort({ name: 1 }).limit(500).project({
        _id: 1,
        name: 1,
        productCount: 1,
      }).toArray(),
      db.collection("categories").find({}).sort({ name: 1 }).limit(500).project({
        _id: 1,
        name: 1,
        slug: 1,
        imageUrl: 1,
        productCount: 1,
      }).toArray(),
    ]);

    return NextResponse.json({
      brands: brands.map((brand) => ({
        id: brand._id.toString(),
        name: brand.name,
        productCount: brand.productCount ?? 0,
      })),
      categories: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl ?? null,
        productCount: category.productCount ?? 0,
      })),
      products: products.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        brand: product.brand?.name ?? null,
        category:
          product.category ??
          product.categories?.[0]?.category?.name ??
          null,
        image:
          product.imageUrls?.[0] ??
          getImage(product) ??
          null,
        price: product.adminAdjustedPrice ?? product.price ?? null,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/catalog error:", error);
    return NextResponse.json(
      { error: "Unable to load catalog data." },
      { status: 500 },
    );
  }
}
