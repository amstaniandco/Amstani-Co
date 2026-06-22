import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  if (!storeId) return NextResponse.json({ products: [] });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const count = await db.collection("owner_catalog").countDocuments({ storeId });

  if (count === 0) {
    // Seed from global catalog for this store
    const store = await db.collection("stores").findOne({ _id: new ObjectId(storeId) });
    if (!store) return NextResponse.json({ products: [] });

    const ownerId = store.ownerId?.toString() ?? "";
    const globalProducts = await db.collection("products").find({ brandSuspended: { $ne: true } }).toArray();

    if (globalProducts.length > 0) {
      const docs = globalProducts.map((p) => ({
        storeId,
        ownerId,
        productId: p._id.toString(),
        name: p.name,
        sku: p.sku,
        description: p.description ?? "",
        mainImage: p.mainImage ?? p.imageUrls?.[0] ?? null,
        imageUrls: p.imageUrls ?? [],
        images: p.images ?? [],
        category: p.category ?? "",
        brand: p.brand ?? null,
        variants: p.variants ?? [],
        originalPrice: p.price ?? 0,
        price: p.price ?? 0,
        status: p.status ?? "active",
        totalStock: p.totalStock ?? p.stock ?? 0,
        allowCustomOrders: p.allowCustomOrders ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.collection("owner_catalog").insertMany(docs);
    }
  }

  const products = await db
    .collection("owner_catalog")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ products });
}
