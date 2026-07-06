import { Pool } from "pg";
import { MongoClient, type Db } from "mongodb";
import { recomputeCatalogCounts } from "./catalog-counts";
import { reapplyStoredAdjustment } from "./price-adjustment";

function groupById<T extends Record<string, unknown>>(rows: T[], key: string): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const row of rows) {
    const id = row[key] as string;
    if (!map[id]) map[id] = [];
    map[id].push(row);
  }
  return map;
}

async function fetchFromSupabase(pool: Pool) {
  const [
    { rows: brands },
    { rows: categories },
    { rows: sizeVariables },
    { rows: products },
    { rows: images },
    { rows: productCategories },
    { rows: variants },
    { rows: sizeCharts },
    { rows: shippings },
  ] = await Promise.all([
    pool.query(`SELECT * FROM brand ORDER BY name ASC`),
    pool.query(`SELECT * FROM category ORDER BY name ASC`),
    pool.query(`SELECT * FROM category_size_variable ORDER BY "sortOrder" ASC`),
    pool.query(`SELECT * FROM product ORDER BY "createdAt" ASC`),
    pool.query(`SELECT * FROM product_images ORDER BY "sortOrder" ASC`),
    pool.query(`
      SELECT pc.*, c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug
      FROM product_category pc
      JOIN category c ON c.id = pc."categoryId"
    `),
    pool.query(`SELECT * FROM product_variant`),
    pool.query(`SELECT * FROM size_chart`),
    pool.query(`SELECT * FROM shipping_info`),
  ]);

  const brandsById: Record<string, typeof brands[0]> = {};
  for (const b of brands) brandsById[b.id] = b;

  const imagesByProduct    = groupById(images, "productId");
  const catsByProduct      = groupById(productCategories, "productId");
  const variantsByProduct  = groupById(variants, "productId");
  const sizeChartsByProduct = groupById(sizeCharts, "productId");
  const shippingByProduct: Record<string, typeof shippings[0]> = {};
  for (const s of shippings) shippingByProduct[s.productId] = s;

  const sizeVarsByCategory = groupById(sizeVariables, "categoryId");

  const enrichedProducts = products.map((p) => ({
    ...p,
    brand: p.brandId ? brandsById[p.brandId] : null,
    images: imagesByProduct[p.id] || [],
    categories: (catsByProduct[p.id] || [])
      .sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) =>
          (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
      )
      .map((pc: Record<string, unknown>) => ({
        categoryId: pc.categoryId,
        isPrimary: pc.isPrimary,
        category: { id: pc.cat_id, name: pc.cat_name, slug: pc.cat_slug },
      })),
    variants: variantsByProduct[p.id] || [],
    sizeChart: sizeChartsByProduct[p.id] || [],
    shipping: shippingByProduct[p.id] || null,
  }));

  const enrichedCategories = categories.map((c) => ({
    ...c,
    sizeVariables: sizeVarsByCategory[c.id] || [],
  }));

  return { brands, categories: enrichedCategories, products: enrichedProducts };
}

function mapProduct(product: Record<string, unknown>) {
  const images = (product.images as Record<string, unknown>[]) || [];
  const imageObjects = images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    alt: img.alt ?? null,
    isMain: img.isMain,
    sortOrder: img.sortOrder,
    createdAt: img.createdAt,
  }));
  const imageUrls = [
    product.mainImage as string,
    ...imageObjects.map((i) => i.imageUrl as string),
  ].filter(Boolean);
  const uniqueImageUrls = Array.from(new Set(imageUrls));

  const categories = (product.categories as Array<{
    isPrimary: boolean;
    categoryId: string;
    category: { id: string; name: string; slug: string };
  }>) || [];

  const primaryCategory =
    categories.find((c) => c.isPrimary)?.category ??
    categories[0]?.category ??
    null;

  const brand    = product.brand as Record<string, unknown> | null;
  const variants = (product.variants as Record<string, unknown>[]) || [];
  const sizeChart = (product.sizeChart as Record<string, unknown>[]) || [];
  const shipping  = product.shipping as Record<string, unknown> | null;

  return {
    sourceProductId:  product.id as string,
    source:           "supabase-postgres" as const,
    name:             product.name,
    sku:              product.sku,
    slug:             product.slug,
    description:      ((product.shortDescription ?? product.fullDescription) as string | null) ?? "",
    shortDescription: (product.shortDescription as string | null) ?? null,
    fullDescription:  (product.fullDescription  as string | null) ?? "",
    price:            product.price,
    compareAtPrice:   (product.compareAtPrice as number | null) ?? null,
    costPrice:        (product.costPrice       as number | null) ?? null,
    stock:            product.totalStock,
    totalStock:       product.totalStock,
    stockStatus:      product.stockStatus,
    imageUrls:        uniqueImageUrls,
    images:           imageObjects,
    mainImage:        (product.mainImage as string | null) ?? uniqueImageUrls[0] ?? null,
    category:         primaryCategory?.name ?? "",
    categories:       categories.map((item) => ({
      categoryId: item.categoryId,
      isPrimary:  item.isPrimary,
      category: { id: item.category.id, name: item.category.name, slug: item.category.slug },
    })),
    brand: brand
      ? { id: brand.id, name: brand.name, slug: brand.slug }
      : undefined,
    variants: variants.map((v) => ({
      id:            v.id,
      size:          v.size ?? "",
      color:         (v.color as string | null | undefined) ?? undefined,
      sku:           v.skuVariant,
      priceOverride: (v.priceOverride as number | null) ?? null,
      stock:         v.stockQuantity,
      stockQuantity: v.stockQuantity,
      skuVariant:    v.skuVariant,
      isCustomSize:  v.isCustomSize ?? false,
    })),
    sizeChart: sizeChart.map((chart) => ({
      id:           chart.id,
      size:         chart.size,
      measurements: chart.measurements,
      unit:         chart.unit,
    })),
    shipping: shipping
      ? {
          productId:     shipping.productId,
          weight:        (shipping.weight        as number | null) ?? null,
          dimensionL:    (shipping.dimensionL    as number | null) ?? null,
          dimensionW:    (shipping.dimensionW    as number | null) ?? null,
          dimensionH:    (shipping.dimensionH    as number | null) ?? null,
          shippingClass: (shipping.shippingClass as string | null) ?? null,
        }
      : null,
    status:           product.isPublished ? "active" : "draft",
    isFeatured:       (product.isFeatured       as boolean) ?? false,
    isPublished:      (product.isPublished       as boolean) ?? false,
    tags:             (product.tags             as string[] | null) ?? [],
    allowCustomOrders:(product.allowCustomOrders as boolean | null) ?? false,
    seoTitle:         (product.seoTitle         as string | null) ?? null,
    seoDescription:   (product.seoDescription   as string | null) ?? null,
    brandSuspended:   false,
    isSuspended:      false,
    createdAt:        product.createdAt ?? new Date(),
    updatedAt:        product.updatedAt ?? new Date(),
    copiedAt:         new Date(),
  };
}

export type SyncResult = {
  newProducts:          number;
  updatedProducts:      number;
  skippedProducts:      number;
  deletedProducts:      number;
  newBrands:            number;
  updatedBrands:        number;
  skippedBrands:        number;
  newCategories:        number;
  updatedCategories:    number;
  skippedCategories:    number;
  brandCountsUpdated:   number;
  categoryCountsUpdated: number;
  priceAdjustedProducts: number;
  storeProductsRefreshed: number;
  ownerCatalogRefreshed: number;
  ownerCatalogSeeded: number;
  log: string[];
};

// Pushes the latest global product data into the store-facing snapshot
// collections so a Supabase change is reflected everywhere:
//   • store_products (customer listings) — refresh the snapshot fields that
//     shadow the live join (name, sku, mainImage).
//   • owner_catalog (owner catalog views)  — refresh display/snapshot fields
//     (name, images, category, brand, variants, stock, …).
// Owner-set pricing (price, sellingPrice, discountPercent, isOnSale,
// variantPrices) and the original-price baseline are deliberately left
// untouched so store owners' customizations survive every sync.
async function propagateGlobalChangesToStores(
  db: Db
): Promise<{ storeProducts: number; ownerCatalog: number }> {
  const globalProducts = await db
    .collection("products")
    .find({})
    .project({
      _id: 1, name: 1, sku: 1, mainImage: 1, imageUrls: 1, images: 1,
      category: 1, brand: 1, description: 1, variants: 1,
      allowCustomOrders: 1, totalStock: 1, stock: 1, status: 1,
    })
    .toArray();

  if (!globalProducts.length) return { storeProducts: 0, ownerCatalog: 0 };

  const now = new Date();
  const storeProductOps = [];
  const ownerCatalogOps = [];

  for (const p of globalProducts) {
    const productId = p._id.toString();
    const mainImage = (p.mainImage as string | null) ?? (p.imageUrls as string[] | undefined)?.[0] ?? null;

    // Customer listings read most fields live from global; only these snapshot
    // fields shadow the live values, so they are the ones that go stale.
    storeProductOps.push({
      updateMany: {
        filter: { productId },
        update: { $set: { name: p.name, sku: p.sku ?? "", mainImage, updatedAt: now } },
      },
    });

    // Owner catalog stores a fuller snapshot — refresh everything except the
    // owner's price/discount fields and the originalPrice baseline.
    ownerCatalogOps.push({
      updateMany: {
        filter: { productId },
        update: {
          $set: {
            name: p.name,
            sku: p.sku ?? "",
            description: p.description ?? "",
            mainImage,
            imageUrls: p.imageUrls ?? [],
            images: p.images ?? [],
            category: p.category ?? "",
            brand: p.brand ?? null,
            variants: p.variants ?? [],
            allowCustomOrders: p.allowCustomOrders ?? false,
            totalStock: p.totalStock ?? p.stock ?? 0,
            status: p.status ?? "active",
            updatedAt: now,
          },
        },
      },
    });
  }

  const [storeRes, ownerRes] = await Promise.all([
    db.collection("store_products").bulkWrite(storeProductOps, { ordered: false }),
    db.collection("owner_catalog").bulkWrite(ownerCatalogOps, { ordered: false }),
  ]);

  return { storeProducts: storeRes.modifiedCount, ownerCatalog: ownerRes.modifiedCount };
}

// Active-catalog filter — a product is visible to store owners only when it's
// published, not archived/draft, and neither it nor its brand is suspended.
// Mirrors ACTIVE_FILTER in GET /api/owner/catalog so both entry points agree.
const OWNER_ACTIVE_FILTER = {
  isPublished: { $ne: false },
  status: { $nin: ["archived", "draft"] },
  brandSuspended: { $ne: true },
  isSuspended: { $ne: true },
};

// Push newly-synced products into EVERY store's owner_catalog immediately, so an
// owner sees new products without having to open their portal (which is what
// otherwise lazily seeds them via GET /api/owner/catalog). This only INSERTS
// rows that are missing — existing rows (and their owner-set pricing) are left
// to propagateGlobalChangesToStores. New rows pre-apply the store's saved bulk
// markup/discount, identical to buildCatalogDoc in the GET route.
async function seedNewProductsIntoStores(db: Db): Promise<number> {
  const [stores, activeProducts] = await Promise.all([
    db.collection("stores").find({}, { projection: { _id: 1, ownerId: 1 } }).toArray(),
    db.collection("products").find(OWNER_ACTIVE_FILTER).toArray(),
  ]);

  if (!stores.length || !activeProducts.length) return 0;

  const now = new Date();
  let inserted = 0;

  for (const store of stores) {
    const storeId = store._id.toString();
    const ownerId = store.ownerId ? store.ownerId.toString() : null;

    const existingIds = new Set(
      (
        await db
          .collection("owner_catalog")
          .find({ storeId }, { projection: { productId: 1 } })
          .toArray()
      ).map((d) => d.productId as string)
    );

    // The store's saved bulk markup/discount, so new products inherit it.
    const settings = await db
      .collection("owner_catalog_settings")
      .findOne({ _id: storeId as unknown as never });
    const adjType =
      settings?.type === "markup" || settings?.type === "discount"
        ? (settings.type as "markup" | "discount")
        : null;
    const adjPct = Number(settings?.percent);
    const ownerAdj = adjType && adjPct > 0 ? { type: adjType, percent: adjPct } : null;

    const docs = [];
    for (const p of activeProducts) {
      const productId = p._id.toString();
      if (existingIds.has(productId)) continue;

      const base = (p.adminAdjustedPrice as number) ?? (p.price as number) ?? 0;
      let price = base;
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

      docs.push({
        storeId,
        ownerId,
        productId,
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
        createdAt: now,
        updatedAt: now,
      });
    }

    if (docs.length) {
      const res = await db.collection("owner_catalog").insertMany(docs, { ordered: false });
      inserted += res.insertedCount;
    }
  }

  return inserted;
}

export async function runSupabaseSync(): Promise<SyncResult> {
  const SUPABASE_DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
  const MONGODB_URI    = process.env.MONGODB_URI    || "mongodb://127.0.0.1:27017/amstani";
  const MONGODB_DBNAME = process.env.MONGODB_DBNAME || "amstani";

  if (!SUPABASE_DATABASE_URL) throw new Error("SUPABASE_DATABASE_URL is not configured");

  const pool        = new Pool({ connectionString: SUPABASE_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const mongoClient = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    const { brands, categories, products } = await fetchFromSupabase(pool);
    const docs = products.map(mapProduct);

    await mongoClient.connect();
    const db            = mongoClient.db(MONGODB_DBNAME);
    const productsCol   = db.collection("products");
    const brandsCol     = db.collection("brands");
    const categoriesCol = db.collection("categories");

    // Never (re)write a product that's already been suspended locally —
    // suspension is a deliberate admin decision; Supabase has no concept of it.
    const suspendedIds = new Set(
      (
        await productsCol
          .find(
            {
              sourceProductId: { $in: docs.map((d) => d.sourceProductId) },
              $or: [{ isSuspended: true }, { brandSuspended: true }],
            },
            { projection: { sourceProductId: 1 } }
          )
          .toArray()
      ).map((d) => d.sourceProductId as string)
    );
    const syncableDocs = docs.filter((doc) => !suspendedIds.has(doc.sourceProductId));

    // ── Products ─────────────────────────────────────────────────────────────
    // New products are fully inserted.
    // Existing products: everything is updated from Supabase EXCEPT stock
    // fields (stock, totalStock, stockStatus) which are managed locally.
    let newProducts = 0;
    let updatedProducts = 0;
    if (syncableDocs.length > 0) {
      const result = await productsCol.bulkWrite(
        syncableDocs.map((doc) => {
          const { stock, totalStock, stockStatus, createdAt, ...updateFields } = doc;
          return {
            updateOne: {
              filter: { sourceProductId: doc.sourceProductId },
              update: {
                $setOnInsert: { stock, totalStock, stockStatus, createdAt },
                $set: { ...updateFields },
              },
              upsert: true,
            },
          };
        }),
        { ordered: false }
      );
      newProducts     = result.upsertedCount;
      updatedProducts = result.modifiedCount;
    }

    await productsCol.createIndex({ sourceProductId: 1 }, { unique: true });
    await productsCol.createIndex({ slug: 1 }, { sparse: true });
    await productsCol.createIndex({ sku:  1 }, { sparse: true });

    // ── Remove every product that isn't in Supabase ──────────────────────────
    // Supabase is the single source of truth: after the upsert, anything in the
    // local catalog whose sourceProductId is absent from the freshly-fetched set
    // is deleted — including admin-created products (which have no
    // sourceProductId at all) and suspended ones. Their store-facing snapshots
    // are torn down too so nothing points at a product that no longer exists.
    let deletedProducts = 0;
    const supabaseSourceIds = docs.map((d) => d.sourceProductId);
    // Safety guard: if Supabase returned nothing this is almost certainly a
    // fetch problem, not a genuinely empty catalog — skip deletion so a hiccup
    // can't wipe the whole local catalog.
    if (supabaseSourceIds.length > 0) {
      const orphans = await productsCol
        .find(
          { sourceProductId: { $nin: supabaseSourceIds } },
          { projection: { _id: 1 } }
        )
        .toArray();

      if (orphans.length > 0) {
        const orphanObjectIds  = orphans.map((o) => o._id);
        const orphanProductIds = orphans.map((o) => o._id.toString());

        const delRes = await productsCol.deleteMany({ _id: { $in: orphanObjectIds } });
        deletedProducts = delRes.deletedCount;

        // Tear down the store-facing snapshots that shadowed these now-gone products.
        await Promise.all([
          db.collection("store_products").deleteMany({ productId: { $in: orphanProductIds } }),
          db.collection("owner_catalog").deleteMany({ productId: { $in: orphanProductIds } }),
        ]);
      }
    }

    // ── Brands ───────────────────────────────────────────────────────────────
    let newBrands = 0;
    let updatedBrands = 0;
    if (brands.length > 0) {
      const result = await brandsCol.bulkWrite(
        brands.map((brand) => ({
          updateOne: {
            filter: { sourceBrandId: brand.id },
            update: {
              $setOnInsert: {
                sourceBrandId: brand.id,
                source:        "supabase-postgres",
                status:        "active",
                productCount:  0,
                createdAt:     brand.createdAt ?? new Date(),
              },
              $set: {
                name:      brand.name,
                slug:      brand.slug,
                updatedAt: brand.updatedAt ?? new Date(),
                copiedAt:  new Date(),
              },
            },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      newBrands     = result.upsertedCount;
      updatedBrands = result.modifiedCount;
    }

    // ── Categories ───────────────────────────────────────────────────────────
    let newCategories = 0;
    let updatedCategories = 0;
    if (categories.length > 0) {
      const result = await categoriesCol.bulkWrite(
        categories.map((category) => ({
          updateOne: {
            filter: { sourceCategoryId: category.id },
            update: {
              $setOnInsert: {
                sourceCategoryId: category.id,
                source:           "supabase-postgres",
                status:           "active",
                productCount:     0,
                createdAt:        category.createdAt ?? new Date(),
              },
              $set: {
                name:      category.name,
                slug:      category.slug,
                sizeVariables: (category.sizeVariables || []).map((sv: Record<string, unknown>) => ({
                  sourceSizeVariableId: sv.id,
                  name:      sv.name,
                  label:     sv.label,
                  sortOrder: sv.sortOrder,
                  isDefault: sv.isDefault ?? false,
                })),
                updatedAt: category.updatedAt ?? new Date(),
                copiedAt:  new Date(),
              },
            },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      newCategories     = result.upsertedCount;
      updatedCategories = result.modifiedCount;
    }

    await brandsCol.createIndex(    { sourceBrandId:    1 }, { unique: true, sparse: true });
    await brandsCol.createIndex(    { slug: 1 },             { unique: true, sparse: true });
    await categoriesCol.createIndex({ sourceCategoryId: 1 }, { unique: true, sparse: true });
    await categoriesCol.createIndex({ slug: 1 },             { unique: true, sparse: true });

    const { brandCount, categoryCount } = await recomputeCatalogCounts(db);

    // Re-apply the admin's saved bulk price adjustment so new products and any
    // products whose Supabase price changed instantly inherit the markup —
    // without the admin having to re-enter the percentage after every sync.
    // Must run BEFORE propagation so per-variant adjusted prices flow downstream.
    const priceAdjustedProducts = await reapplyStoredAdjustment(db);

    // Push the refreshed global product data (name, images, variants, stock,
    // category, …) down into the store-facing snapshots so a Supabase change is
    // reflected everywhere. Owner-set prices/discounts are never touched.
    const { storeProducts: storeProductsRefreshed, ownerCatalog: ownerCatalogRefreshed } =
      await propagateGlobalChangesToStores(db);

    // Fan new products out into every store's catalog now, so owners don't have
    // to open their portal for new products to appear.
    const ownerCatalogSeeded = await seedNewProductsIntoStores(db);

    const skippedProducts   = docs.length        - newProducts   - updatedProducts;
    const skippedBrands     = brands.length      - newBrands     - updatedBrands;
    const skippedCategories = categories.length  - newCategories - updatedCategories;

    return {
      newProducts,
      updatedProducts,
      skippedProducts,
      deletedProducts,
      newBrands,
      updatedBrands,
      skippedBrands,
      newCategories,
      updatedCategories,
      skippedCategories,
      brandCountsUpdated:    brandCount,
      categoryCountsUpdated: categoryCount,
      priceAdjustedProducts,
      storeProductsRefreshed,
      ownerCatalogRefreshed,
      ownerCatalogSeeded,
      log: [
        `Fetched from Supabase (read-only): ${docs.length} products · ${brands.length} brands · ${categories.length} categories.`,
        `Products  : ${newProducts} new · ${updatedProducts} updated (stock preserved) · ${skippedProducts} unchanged${deletedProducts ? ` · ${deletedProducts} deleted (gone from Supabase)` : ""}${suspendedIds.size ? ` — ${suspendedIds.size} suspended (skipped)` : ""}.`,
        `Brands    : ${newBrands} new · ${updatedBrands} updated · ${skippedBrands} unchanged.`,
        `Categories: ${newCategories} new · ${updatedCategories} updated · ${skippedCategories} unchanged.`,
        `Product counts relinked: ${brandCount} brands · ${categoryCount} categories.`,
        priceAdjustedProducts > 0
          ? `Price adjustment re-applied to ${priceAdjustedProducts} products.`
          : "No saved price adjustment to re-apply.",
        `Store snapshots refreshed: ${storeProductsRefreshed} customer listings · ${ownerCatalogRefreshed} catalog entries.`,
        ownerCatalogSeeded > 0
          ? `New products fanned out to store catalogs: ${ownerCatalogSeeded} entries added.`
          : "No new products to add to store catalogs.",
        "Supabase was not modified — all operations were read-only.",
      ],
    };
  } finally {
    await mongoClient.close().catch(() => {});
    await pool.end().catch(() => {});
  }
}
