import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const saleRows = await db
      .collection("store_products")
      .find({ isOnSale: true, discountPercent: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(60)
      .toArray();

    if (!saleRows.length) return NextResponse.json({ products: [] });

    const storeIds = [...new Set(saleRows.map((r) => r.storeId))].filter((id) =>
      ObjectId.isValid(id)
    );
    const productIds = [...new Set(saleRows.map((r) => r.productId))].filter((id) =>
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
        .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
        .toArray(),
    ]);

    const storeMap = new Map(stores.map((s) => [s._id.toString(), s]));
    const productMap = new Map(globalProducts.map((p) => [p._id.toString(), p]));

    const products = saleRows.map((sp) => {
      const global = productMap.get(sp.productId);
      const store = storeMap.get(sp.storeId);
      const sellingPrice: number = sp.sellingPrice ?? sp.price ?? global?.price ?? 0;
      const discountPercent: number = sp.discountPercent ?? 0;
      const effectivePrice = Math.round(sellingPrice * (1 - discountPercent / 100) * 100) / 100;
      const images: string[] = [];
      if (global?.images?.length) {
        for (const img of global.images) {
          const src = typeof img === "string" ? img : img.imageUrl ?? img.url ?? "";
          if (src) images.push(src);
        }
      }
      if (!images.length && (sp.mainImage ?? global?.mainImage)) {
        images.push(sp.mainImage ?? global?.mainImage);
      }

      return {
        productId: sp.productId,
        storeId: sp.storeId,
        storeName: store?.name ?? sp.storeName ?? "Store",
        name: sp.name ?? global?.name ?? "Product",
        sku: sp.sku ?? global?.sku ?? "",
        price: effectivePrice,
        compareAtPrice: sellingPrice,
        discountPercent,
        isOnSale: true,
        mainImage: images[0] ?? null,
        images,
        variants: global?.variants ?? [],
        description: global?.description ?? global?.fullDescription ?? "",
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products/sale error:", error);
    return NextResponse.json({ products: [] });
  }
}
