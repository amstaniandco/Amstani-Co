import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

const CONFIG_ID = "pricing_config";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const [store, config] = await Promise.all([
    db.collection("stores").findOne({ ownerId: new ObjectId(user.id) }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
  ]);

  if (!store) return NextResponse.json({ products: [], markupPercent: 20 });

  const storeId = store._id.toString();
  const markupPercent: number = config?.markupPercent ?? 20;

  // Check if owner catalog already seeded for this store
  const existing = await db.collection("owner_catalog").countDocuments({ storeId });

  if (existing === 0) {
    // Seed: copy all global products into owner_catalog for this store
    const globalProducts = await db.collection("products").find({}).toArray();
    if (globalProducts.length > 0) {
      const docs = globalProducts.map((p) => ({
        storeId,
        ownerId: user.id,
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
        price: p.price ?? 0, // owner's custom price starts at original
        status: p.status ?? "active",
        totalStock: p.totalStock ?? p.stock ?? 0,
        allowCustomOrders: p.allowCustomOrders ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.collection("owner_catalog").insertMany(docs);
    }
  } else {
    // Sync: add any new global products not yet in owner_catalog
    const existingIds = await db
      .collection("owner_catalog")
      .find({ storeId }, { projection: { productId: 1 } })
      .toArray()
      .then((docs) => new Set(docs.map((d) => d.productId as string)));

    const newGlobal = await db
      .collection("products")
      .find({ _id: { $nin: [...existingIds].map((id) => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean) as ObjectId[] } })
      .toArray();

    if (newGlobal.length > 0) {
      const docs = newGlobal.map((p) => ({
        storeId,
        ownerId: user.id,
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

  return NextResponse.json({ products, markupPercent });
}
