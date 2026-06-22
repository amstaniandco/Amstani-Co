import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";

function extractCategoryTags(global: Record<string, unknown> | null | undefined): string[] {
  const tags: string[] = [];
  const cats = (global?.categories ?? []) as Array<{ category?: { name?: string } }>;
  for (const c of cats) {
    const name = c?.category?.name;
    if (name && !tags.includes(name)) tags.push(name);
  }
  if (tags.length === 0 && typeof global?.category === "string" && global.category) {
    tags.push(global.category);
  }
  return tags;
}

export async function GET(request: Request) {
  try {
    const sp = new URL(request.url).searchParams;
    const q = sp.get("q")?.trim() ?? "";
    const categoryFilter = sp.get("category")?.trim() ?? "";

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const filter: Record<string, unknown> = {};
    if (q) filter.name = { $regex: q, $options: "i" };

    const rows = await db
      .collection("store_products")
      .find(filter)
      .sort({ listedAt: -1 })
      .limit(120)
      .toArray();

    if (!rows.length) return NextResponse.json({ products: [] });

    const storeIds = [...new Set(rows.map((r) => r.storeId))].filter((id) =>
      ObjectId.isValid(id)
    );
    const productIds = [...new Set(rows.map((r) => r.productId))].filter((id) =>
      ObjectId.isValid(id)
    );

    const [stores, globalProducts] = await Promise.all([
      db
        .collection("stores")
        .find({ _id: { $in: storeIds.map((id) => new ObjectId(id)) } })
        .project({ _id: 1, name: 1 })
        .toArray(),
      db
        .collection("products")
        .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) }, brandSuspended: { $ne: true } })
        .toArray(),
    ]);

    const storeMap = new Map(stores.map((s) => [s._id.toString(), s]));
    const productMap = new Map(globalProducts.map((p) => [p._id.toString(), p]));

    // Exclude store_products whose brand is suspended (global product filtered out)
    const activeRows = rows.filter((row) => productMap.has(row.productId));

    let products = activeRows.map((row) => {
      const global = productMap.get(row.productId);
      const store = storeMap.get(row.storeId);
      const sellingPrice: number = row.sellingPrice ?? row.price ?? global?.price ?? 0;
      const discountPercent: number =
        row.isOnSale && (row.discountPercent ?? 0) > 0 ? row.discountPercent : 0;
      const effectivePrice = Math.round(sellingPrice * (1 - discountPercent / 100) * 100) / 100;
      const images: string[] = [];
      if (global?.images?.length) {
        for (const img of global.images) {
          const src = typeof img === "string" ? img : img.imageUrl ?? img.url ?? "";
          if (src) images.push(src);
        }
      }
      if (!images.length && (row.mainImage ?? global?.mainImage)) {
        images.push(row.mainImage ?? global?.mainImage);
      }

      const categoryTags = extractCategoryTags(global);

      return {
        productId: row.productId,
        storeId: row.storeId,
        storeName: store?.name ?? row.storeName ?? "Store",
        name: row.name ?? global?.name ?? "Product",
        sku: row.sku ?? global?.sku ?? "",
        price: effectivePrice,
        compareAtPrice: discountPercent > 0 ? sellingPrice : null,
        discountPercent,
        isOnSale: row.isOnSale ?? false,
        isNewArrival: row.isNewArrival ?? false,
        mainImage: images[0] ?? null,
        images,
        variants: global?.variants ?? [],
        description: global?.description ?? global?.fullDescription ?? "",
        categoryTags,
      };
    });

    // Apply category filter after enriching with global product data
    if (categoryFilter) {
      const lc = categoryFilter.toLowerCase();
      products = products.filter((p) =>
        p.categoryTags.some((t) => t.toLowerCase().includes(lc))
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products/all error:", error);
    return NextResponse.json({ products: [] });
  }
}
