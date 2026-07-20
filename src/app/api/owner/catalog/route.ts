import { NextResponse } from "next/server";
import { ObjectId, type Db } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { resolveEffectivePricingRule } from "../../../../lib/pricing-config";

const CONFIG_ID = "pricing_config";

type OwnerAdjustment = { type: "markup" | "discount"; percent: number };

// Per-store record of the owner's last bulk markup/discount, kept so new
// products entering the catalog inherit the same adjustment automatically.
// One document per store, keyed by storeId.
async function getOwnerAdjustment(db: Db, storeId: string): Promise<OwnerAdjustment | null> {
  const doc = await db
    .collection("owner_catalog_settings")
    .findOne({ _id: storeId as unknown as never });
  if (!doc) return null;
  const type = doc.type as "markup" | "discount";
  const percent = Number(doc.percent);
  if ((type !== "markup" && type !== "discount") || !(percent > 0)) return null;
  return { type, percent };
}

async function saveOwnerAdjustment(db: Db, storeId: string, type: "markup" | "discount", percent: number) {
  await db.collection("owner_catalog_settings").updateOne(
    { _id: storeId as unknown as never },
    { $set: { type, percent, updatedAt: new Date() } },
    { upsert: true }
  );
}

async function clearOwnerAdjustment(db: Db, storeId: string) {
  await db.collection("owner_catalog_settings").deleteOne({ _id: storeId as unknown as never });
}

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const [store, config, ownerUser] = await Promise.all([
    db.collection("stores").findOne({ ownerId: new ObjectId(user.id) }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
    db.collection("users").findOne({ _id: new ObjectId(user.id) }, { projection: { state: 1 } }),
  ]);

  if (!store) return NextResponse.json({ products: [], markupPercent: 20 });

  const storeId = store._id.toString();
  const effectiveRule = resolveEffectivePricingRule(
    { markupPercent: config?.markupPercent ?? 20, discountCap: config?.discountCap ?? 20, stateRules: config?.stateRules },
    ownerUser?.state as string | undefined
  );
  const markupPercent: number = effectiveRule.markupPercent;

  // Check if owner catalog already seeded for this store
  const existing = await db.collection("owner_catalog").countDocuments({ storeId });

  const ACTIVE_FILTER = { isPublished: { $ne: false }, status: { $nin: ["archived", "draft"] }, brandSuspended: { $ne: true }, isSuspended: { $ne: true } };

  // The owner's saved bulk markup/discount, so new products entering the catalog
  // inherit the same adjustment automatically (no need to re-apply each time).
  const ownerAdj = await getOwnerAdjustment(db, storeId);

  // Builds a fresh owner_catalog entry for a global product, pre-applying the
  // owner's saved markup/discount (if any) on top of the catalog base price
  // (adminAdjustedPrice ?? wholesale price).
  function buildCatalogDoc(p: Record<string, unknown>) {
    const base = (p.adminAdjustedPrice as number) ?? (p.price as number) ?? 0;
    let price = base; // owner's price defaults to the catalog base
    let discountPercent = 0;
    let isOnSale = false;
    if (ownerAdj) {
      if (ownerAdj.type === "markup") {
        price = Math.round(base * (1 + ownerAdj.percent / 100) * 100) / 100;
      } else {
        discountPercent = ownerAdj.percent;
        isOnSale = ownerAdj.percent > 0;
      }
    }
    return {
      storeId,
      ownerId: user!.id,
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
      price,
      discountPercent,
      isOnSale,
      status: p.status ?? "active",
      totalStock: p.totalStock ?? p.stock ?? 0,
      allowCustomOrders: p.allowCustomOrders ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  if (existing === 0) {
    // Seed: copy only active/published products into owner_catalog for this store
    const globalProducts = await db.collection("products").find(ACTIVE_FILTER).toArray();
    if (globalProducts.length > 0) {
      await db.collection("owner_catalog").insertMany(globalProducts.map(buildCatalogDoc));
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
      .find({
        ...ACTIVE_FILTER,
        _id: { $nin: [...existingIds].map((id) => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean) as ObjectId[] },
      })
      .toArray();

    if (newGlobal.length > 0) {
      await db.collection("owner_catalog").insertMany(newGlobal.map(buildCatalogDoc));
    }
  }

  const discountCap: number = effectiveRule.discountCap;

  const catalogItems = await db
    .collection("owner_catalog")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .toArray();

  // Enrich with adminAdjustedPrice from global products
  const globalIds = catalogItems
    .map((c) => { try { return new ObjectId(c.productId as string); } catch { return null; } })
    .filter(Boolean) as ObjectId[];

  const globalDocs = globalIds.length
    ? await db.collection("products")
        .find({ _id: { $in: globalIds } })
        .project({ _id: 1, adminAdjustedPrice: 1, isPublished: 1, status: 1, brandSuspended: 1, isSuspended: 1, variants: 1, description: 1 })
        .toArray()
    : [];
  const globalMap = new Map(globalDocs.map((d) => [d._id.toString(), d]));

  const products = catalogItems
    .filter((c) => {
      const gp = globalMap.get(c.productId as string);
      if (!gp) return false; // removed from global catalog
      if (gp.isPublished === false) return false;
      if (gp.status === "archived" || gp.status === "draft") return false;
      if (gp.brandSuspended === true || gp.isSuspended === true) return false;
      return true;
    })
    .map((c) => {
      const gp = globalMap.get(c.productId as string);
      return {
        ...c,
        adminAdjustedPrice: (gp?.adminAdjustedPrice as number) ?? null,
        // Use fresh global variants/description so detail view reflects admin edits
        variants: (gp?.variants as unknown[]) ?? c.variants ?? [],
        description: (gp?.description as string) ?? c.description ?? "",
      };
    });

  return NextResponse.json({ products, markupPercent, discountCap, adjustment: ownerAdj });
}

// Bulk-apply markup or discount to ALL products in this owner's catalog
export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const type: "markup" | "discount" | "reset" = body.type;
  const percent: number = Number(body.percent ?? 0);

  if (type !== "markup" && type !== "discount" && type !== "reset") {
    return NextResponse.json({ error: "type must be markup, discount, or reset" }, { status: 400 });
  }
  if (type !== "reset" && (isNaN(percent) || percent < 0)) {
    return NextResponse.json({ error: "percent must be >= 0" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const storeId = store._id.toString();

  const [config, ownerUser] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
    db.collection("users").findOne({ _id: new ObjectId(user.id) }, { projection: { state: 1 } }),
  ]);
  const effectiveRule = resolveEffectivePricingRule(
    { markupPercent: config?.markupPercent ?? 20, discountCap: config?.discountCap ?? 20, stateRules: config?.stateRules },
    ownerUser?.state as string | undefined
  );
  const markupPercent: number = effectiveRule.markupPercent;
  const discountCap: number = effectiveRule.discountCap;

  if (type === "markup" && percent > markupPercent) {
    return NextResponse.json({ error: `Markup cannot exceed ${markupPercent}% (platform limit).` }, { status: 400 });
  }
  if (type === "discount" && percent > discountCap) {
    return NextResponse.json({ error: `Discount cannot exceed ${discountCap}% (platform limit).` }, { status: 400 });
  }

  const catalogItems = await db
    .collection("owner_catalog")
    .find({ storeId }, { projection: { productId: 1, originalPrice: 1 } })
    .toArray();

  if (!catalogItems.length) return NextResponse.json({ ok: true, updatedCount: 0 });

  // Fetch adminAdjustedPrice for each product
  const globalIds = catalogItems
    .map((c) => { try { return new ObjectId(c.productId as string); } catch { return null; } })
    .filter(Boolean) as ObjectId[];
  const globalDocs = globalIds.length
    ? await db.collection("products").find({ _id: { $in: globalIds } }).project({ _id: 1, adminAdjustedPrice: 1 }).toArray()
    : [];
  const globalMap = new Map(globalDocs.map((d) => [d._id.toString(), d]));

  const now = new Date();
  const bulkOps = catalogItems.map((c) => {
    const gp = globalMap.get(c.productId as string);
    const base = (gp?.adminAdjustedPrice as number) ?? (c.originalPrice as number) ?? 0;
    let newPrice: number;
    let discountPercent = 0;
    let isOnSale = false;

    if (type === "reset") {
      newPrice = base;
    } else if (type === "markup") {
      newPrice = Math.round(base * (1 + percent / 100) * 100) / 100;
    } else {
      // discount
      newPrice = base;
      discountPercent = percent;
      isOnSale = percent > 0;
    }

    return {
      updateOne: {
        filter: { storeId, productId: c.productId as string },
        update: {
          $set: {
            price: newPrice,
            discountPercent,
            isOnSale,
            updatedAt: now,
          },
        },
      },
    };
  });

  const result = await db.collection("owner_catalog").bulkWrite(bulkOps, { ordered: false });

  // Persist the owner's choice so products added to the catalog later inherit
  // the same adjustment automatically. Reset clears it.
  if (type === "reset") {
    await clearOwnerAdjustment(db, storeId);
  } else {
    await saveOwnerAdjustment(db, storeId, type, percent);
  }

  return NextResponse.json({ ok: true, updatedCount: result.modifiedCount });
}
