import { Pool } from "pg";
import { MongoClient } from "mongodb";
import { recomputeCatalogCounts } from "./catalog-counts";

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
  updatedPrices:        number;
  skippedProducts:      number;
  newBrands:            number;
  skippedBrands:        number;
  newCategories:        number;
  skippedCategories:    number;
  brandCountsUpdated:   number;
  categoryCountsUpdated: number;
  log: string[];
};

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
    // New products are inserted in full via $setOnInsert.
    // Existing products are not overwritten — they belong to this site now —
    // except for prices, which are always kept in sync with Supabase.
    let newProducts = 0;
    let updatedPrices = 0;
    if (syncableDocs.length > 0) {
      const result = await productsCol.bulkWrite(
        syncableDocs.map((doc) => {
          const { price, compareAtPrice, costPrice, ...rest } = doc;
          return {
            updateOne: {
              filter: { sourceProductId: doc.sourceProductId },
              update: {
                $setOnInsert: rest,
                $set: { price, compareAtPrice, costPrice },
              },
              upsert: true,
            },
          };
        }),
        { ordered: false }
      );
      newProducts   = result.upsertedCount;
      updatedPrices = result.modifiedCount;
    }

    await productsCol.createIndex({ sourceProductId: 1 }, { unique: true });
    await productsCol.createIndex({ slug: 1 }, { sparse: true });
    await productsCol.createIndex({ sku:  1 }, { sparse: true });

    // ── Brands ───────────────────────────────────────────────────────────────
    let newBrands = 0;
    if (brands.length > 0) {
      const result = await brandsCol.bulkWrite(
        brands.map((brand) => ({
          updateOne: {
            filter: { sourceBrandId: brand.id },
            update: {
              $setOnInsert: {
                sourceBrandId: brand.id,
                source:        "supabase-postgres",
                name:          brand.name,
                slug:          brand.slug,
                status:        "active",
                productCount:  0,
                createdAt:     brand.createdAt ?? new Date(),
                updatedAt:     brand.updatedAt ?? new Date(),
                copiedAt:      new Date(),
              },
            },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      newBrands = result.upsertedCount;
    }

    // ── Categories ───────────────────────────────────────────────────────────
    let newCategories = 0;
    if (categories.length > 0) {
      const result = await categoriesCol.bulkWrite(
        categories.map((category) => ({
          updateOne: {
            filter: { sourceCategoryId: category.id },
            update: {
              $setOnInsert: {
                sourceCategoryId: category.id,
                source:           "supabase-postgres",
                name:             category.name,
                slug:             category.slug,
                status:           "active",
                productCount:     0,
                sizeVariables: (category.sizeVariables || []).map((sv: Record<string, unknown>) => ({
                  sourceSizeVariableId: sv.id,
                  name:      sv.name,
                  label:     sv.label,
                  sortOrder: sv.sortOrder,
                  isDefault: sv.isDefault ?? false,
                })),
                createdAt: category.createdAt ?? new Date(),
                updatedAt: category.updatedAt ?? new Date(),
                copiedAt:  new Date(),
              },
            },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      newCategories = result.upsertedCount;
    }

    await brandsCol.createIndex(    { sourceBrandId:    1 }, { unique: true, sparse: true });
    await brandsCol.createIndex(    { slug: 1 },             { unique: true, sparse: true });
    await categoriesCol.createIndex({ sourceCategoryId: 1 }, { unique: true, sparse: true });
    await categoriesCol.createIndex({ slug: 1 },             { unique: true, sparse: true });

    const { brandCount, categoryCount } = await recomputeCatalogCounts(db);

    const skippedProducts   = docs.length        - newProducts   - updatedPrices;
    const skippedBrands     = brands.length      - newBrands;
    const skippedCategories = categories.length  - newCategories;

    return {
      newProducts,
      updatedPrices,
      skippedProducts,
      newBrands,
      skippedBrands,
      newCategories,
      skippedCategories,
      brandCountsUpdated:    brandCount,
      categoryCountsUpdated: categoryCount,
      log: [
        `Fetched from Supabase (read-only): ${docs.length} products · ${brands.length} brands · ${categories.length} categories.`,
        `Products  : ${newProducts} new · ${updatedPrices} prices updated · ${skippedProducts} unchanged or suspended (skipped)${suspendedIds.size ? ` — ${suspendedIds.size} suspended` : ""}.`,
        `Brands    : ${newBrands} new · ${skippedBrands} already here (skipped).`,
        `Categories: ${newCategories} new · ${skippedCategories} already here (skipped).`,
        `Product counts relinked: ${brandCount} brands · ${categoryCount} categories.`,
        "Supabase was not modified — all operations were read-only.",
      ],
    };
  } finally {
    await mongoClient.close().catch(() => {});
    await pool.end().catch(() => {});
  }
}
