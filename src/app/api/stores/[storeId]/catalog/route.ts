import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

// Products that are eligible to appear in a store's customer-facing catalog.
// Mirrors the filter used by the owner catalog route so both views stay aligned.
const ACTIVE_FILTER = {
  brandSuspended: { $ne: true },
  isSuspended: { $ne: true },
  isPublished: { $ne: false },
  status: { $nin: ["archived", "draft"] },
};

export async function GET(_req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  if (!storeId) return NextResponse.json({ products: [] });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ _id: new ObjectId(storeId) });
  if (!store) return NextResponse.json({ products: [] });
  const ownerId = store.ownerId?.toString() ?? "";

  // Builds a fresh owner_catalog entry for a global product. Used both for the
  // initial seed and for syncing products added to the global catalog later.
  const buildCatalogDoc = (p: Record<string, unknown>) => {
    const basePrice = (p.adminAdjustedPrice as number) ?? (p.price as number) ?? 0;
    return {
      storeId,
      ownerId,
      productId: (p._id as ObjectId).toString(),
      name: p.name,
      sku: p.sku,
      description: p.description ?? "",
      mainImage: (p.mainImage as string | null) ?? (p.imageUrls as string[] | undefined)?.[0] ?? null,
      imageUrls: p.imageUrls ?? [],
      images: p.images ?? [],
      category: p.category ?? "",
      brand: p.brand ?? null,
      variants: p.variants ?? [],
      originalPrice: p.price ?? 0,
      price: basePrice,
      status: p.status ?? "active",
      totalStock: p.totalStock ?? p.stock ?? 0,
      allowCustomOrders: p.allowCustomOrders ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const count = await db.collection("owner_catalog").countDocuments({ storeId });

  if (count === 0) {
    // Seed from global catalog for this store
    const globalProducts = await db.collection("products").find(ACTIVE_FILTER).toArray();
    if (globalProducts.length > 0) {
      await db.collection("owner_catalog").insertMany(globalProducts.map(buildCatalogDoc));
    }
  } else {
    // Sync: add any newly-eligible global products not yet in this store's catalog,
    // so brands/products added after the initial seed become visible to customers.
    const existingIds = await db
      .collection("owner_catalog")
      .find({ storeId }, { projection: { productId: 1 } })
      .toArray()
      .then((docs) => new Set(docs.map((d) => d.productId as string)));

    const newGlobal = await db
      .collection("products")
      .find({
        ...ACTIVE_FILTER,
        _id: { $nin: [...existingIds].map((id) => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean) as ObjectId[] },
      })
      .toArray();

    if (newGlobal.length > 0) {
      await db.collection("owner_catalog").insertMany(newGlobal.map(buildCatalogDoc));
    }
  }

  const catalogItems = await db
    .collection("owner_catalog")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .toArray();

  // Join with global products to get current adminAdjustedPrice
  const globalIds = catalogItems
    .map((c) => { try { return new ObjectId(c.productId as string); } catch { return null; } })
    .filter(Boolean) as ObjectId[];

  const globalDocs = globalIds.length
    ? await db.collection("products")
        .find({ _id: { $in: globalIds } })
        .project({ _id: 1, adminAdjustedPrice: 1, price: 1, isPublished: 1, status: 1, brandSuspended: 1, isSuspended: 1 })
        .toArray()
    : [];

  const globalMap = new Map(globalDocs.map((d) => [d._id.toString(), d]));

  const products = catalogItems
    .filter((c) => {
      const gp = globalMap.get(c.productId as string);
      if (!gp) return false;
      if (gp.isPublished === false) return false;
      if (gp.status === "archived" || gp.status === "draft") return false;
      if (gp.brandSuspended === true || gp.isSuspended === true) return false;
      return true;
    })
    .map((c) => {
    const gp = globalMap.get(c.productId as string);
    // Admin-adjusted price is the authoritative base; fall back to catalog entry price
    const adminBase: number = (gp?.adminAdjustedPrice as number) ?? (c.originalPrice as number) ?? (c.price as number) ?? 0;
    const ownerPrice: number = c.price as number ?? adminBase;
    // If owner hasn't set a custom price (price ≈ originalPrice), show adminBase
    const originalPrice: number = c.originalPrice as number ?? 0;
    const ownerCustomized = Math.abs(ownerPrice - originalPrice) > 0.01;
    const displayPrice = ownerCustomized ? ownerPrice : adminBase;

    return {
      ...c,
      adminAdjustedPrice: adminBase,
      price: displayPrice,
    };
  });

  return NextResponse.json({ products });
}
