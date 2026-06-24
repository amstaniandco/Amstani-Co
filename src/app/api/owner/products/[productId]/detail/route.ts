import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { getUserFromToken } from "../../../../../../lib/auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { productId } = await context.params;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await db.collection("stores").findOne({ ownerId: new ObjectId(tokenUser.id) });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const storeProduct = await db.collection("store_products").findOne({
      storeId: store._id.toString(),
      productId,
    });
    if (!storeProduct) return NextResponse.json({ error: "Product not in your store" }, { status: 404 });

    let catalogProduct = null;
    if (ObjectId.isValid(productId)) {
      catalogProduct = await db.collection("products").findOne({ _id: new ObjectId(productId) });
    }

    if (catalogProduct?.brandSuspended || catalogProduct?.isSuspended) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      storeProduct: {
        sellingPrice: storeProduct.sellingPrice ?? null,
        originalPrice: storeProduct.originalPrice ?? storeProduct.price ?? null,
        adminAdjustedPrice: (catalogProduct?.adminAdjustedPrice as number) ?? null,
        discountPercent: storeProduct.discountPercent ?? 0,
        isOnSale: storeProduct.isOnSale ?? false,
        isNewArrival: storeProduct.isNewArrival ?? false,
        listedAt: storeProduct.listedAt ?? null,
        quantity: storeProduct.quantity ?? 0,
        variantPrices: (storeProduct.variantPrices as Record<string, number>) ?? {},
      },
      catalog: catalogProduct,
    });
  } catch (error) {
    console.error("GET /api/owner/products/[productId]/detail error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
