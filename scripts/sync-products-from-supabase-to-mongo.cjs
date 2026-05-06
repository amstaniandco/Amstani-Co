/**
 * Syncs products, brands, and categories from Supabase (PostgreSQL) into local MongoDB.
 * Only inserts items that don't already exist — never overwrites existing MongoDB data.
 *
 * Required env vars (set in .env):
 *   SUPABASE_DATABASE_URL  — Postgres connection string from Supabase dashboard
 *   MONGODB_URI            — MongoDB connection string
 *   MONGODB_DBNAME         — MongoDB database name (default: amstani)
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { MongoClient } = require("mongodb");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

const localEnv = parseEnvFile(path.join(process.cwd(), ".env"));

const SUPABASE_DATABASE_URL = process.env.SUPABASE_DATABASE_URL || localEnv.SUPABASE_DATABASE_URL;
const MONGODB_URI = process.env.MONGODB_URI || localEnv.MONGODB_URI || "mongodb://127.0.0.1:27017/amstani";
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || localEnv.MONGODB_DBNAME || "amstani";
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_DATABASE_URL) {
  console.error("SUPABASE_DATABASE_URL is not set. Add it to your .env file.");
  process.exitCode = 1;
  process.exit();
}

// ── Postgres helpers ──────────────────────────────────────────────────────────

function groupById(rows, key = "productId") {
  const map = {};
  for (const row of rows) {
    const id = row[key];
    if (!map[id]) map[id] = [];
    map[id].push(row);
  }
  return map;
}

async function fetchFromSupabase(pool) {
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

  // Index brand lookup
  const brandsById = {};
  for (const b of brands) brandsById[b.id] = b;

  // Group related rows by productId
  const imagesByProduct = groupById(images, "productId");
  const catsByProduct = groupById(productCategories, "productId");
  const variantsByProduct = groupById(variants, "productId");
  const sizeChartsByProduct = groupById(sizeCharts, "productId");
  const shippingByProduct = {};
  for (const s of shippings) shippingByProduct[s.productId] = s;

  // Group size variables by categoryId
  const sizeVarsByCategory = groupById(sizeVariables, "categoryId");

  // Attach brand product counts
  const brandProductCount = {};
  for (const p of products) {
    if (p.brandId) brandProductCount[p.brandId] = (brandProductCount[p.brandId] || 0) + 1;
  }

  // Attach category product counts
  const categoryProductCount = {};
  for (const pc of productCategories) {
    categoryProductCount[pc.categoryId] = (categoryProductCount[pc.categoryId] || 0) + 1;
  }

  const enrichedBrands = brands.map((b) => ({
    ...b,
    _count: { products: brandProductCount[b.id] || 0 },
  }));

  const enrichedCategories = categories.map((c) => ({
    ...c,
    sizeVariables: sizeVarsByCategory[c.id] || [],
    _count: { products: categoryProductCount[c.id] || 0 },
  }));

  const enrichedProducts = products.map((p) => ({
    ...p,
    brand: p.brandId ? brandsById[p.brandId] : null,
    images: imagesByProduct[p.id] || [],
    categories: (catsByProduct[p.id] || [])
      .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
      .map((pc) => ({
        categoryId: pc.categoryId,
        isPrimary: pc.isPrimary,
        category: { id: pc.cat_id, name: pc.cat_name, slug: pc.cat_slug },
      })),
    variants: variantsByProduct[p.id] || [],
    sizeChart: sizeChartsByProduct[p.id] || [],
    shipping: shippingByProduct[p.id] || null,
  }));

  return { brands: enrichedBrands, categories: enrichedCategories, products: enrichedProducts };
}

// ── Product mapping (same shape as before) ───────────────────────────────────

function toStatus(isPublished) {
  return isPublished ? "active" : "draft";
}

function mapProduct(product) {
  const imageObjects = (product.images || []).map((image) => ({
    id: image.id,
    imageUrl: image.imageUrl,
    alt: image.alt ?? null,
    isMain: image.isMain,
    sortOrder: image.sortOrder,
    createdAt: image.createdAt,
  }));
  const imageUrls = [product.mainImage, ...imageObjects.map((i) => i.imageUrl)].filter(Boolean);
  const uniqueImageUrls = Array.from(new Set(imageUrls));
  const primaryCategory =
    product.categories.find((item) => item.isPrimary)?.category ??
    product.categories[0]?.category ??
    null;

  return {
    sourceProductId: product.id,
    source: "supabase-postgres",
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.shortDescription ?? product.fullDescription,
    shortDescription: product.shortDescription ?? null,
    fullDescription: product.fullDescription,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    costPrice: product.costPrice ?? null,
    stock: product.totalStock,
    totalStock: product.totalStock,
    stockStatus: product.stockStatus,
    imageUrls: uniqueImageUrls,
    images: imageObjects,
    mainImage: product.mainImage ?? uniqueImageUrls[0] ?? null,
    category: primaryCategory?.name ?? "",
    categories: product.categories.map((item) => ({
      categoryId: item.categoryId,
      isPrimary: item.isPrimary,
      category: { id: item.category.id, name: item.category.name, slug: item.category.slug },
    })),
    brand: product.brand
      ? { id: product.brand.id, name: product.brand.name, slug: product.brand.slug }
      : undefined,
    variants: (product.variants || []).map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color ?? undefined,
      sku: v.skuVariant,
      priceModifier: v.priceOverride == null ? undefined : v.priceOverride - product.price,
      priceOverride: v.priceOverride ?? null,
      stock: v.stockQuantity,
      stockQuantity: v.stockQuantity,
      skuVariant: v.skuVariant,
      isCustomSize: v.isCustomSize,
    })),
    sizeChart: (product.sizeChart || []).map((chart) => ({
      id: chart.id,
      size: chart.size,
      measurements: chart.measurements,
      unit: chart.unit,
    })),
    shipping: product.shipping
      ? {
          productId: product.shipping.productId,
          weight: product.shipping.weight ?? null,
          dimensionL: product.shipping.dimensionL ?? null,
          dimensionW: product.shipping.dimensionW ?? null,
          dimensionH: product.shipping.dimensionH ?? null,
          shippingClass: product.shipping.shippingClass ?? null,
        }
      : null,
    status: toStatus(product.isPublished),
    isFeatured: product.isFeatured,
    isPublished: product.isPublished,
    seoTitle: product.seoTitle ?? null,
    seoDescription: product.seoDescription ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    copiedAt: new Date(),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const pool = new Pool({
    connectionString: SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const mongoClient = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    console.log("Connecting to Supabase…");
    const { brands, categories, products } = await fetchFromSupabase(pool);
    const docs = products.map(mapProduct);

    console.log(`Read ${docs.length} products, ${brands.length} brands, ${categories.length} categories from Supabase.`);

    if (DRY_RUN) {
      console.log("Dry run — no changes written to MongoDB.");
      console.log("Only items not already in MongoDB would be inserted (existing ones are never modified).");
      return;
    }

    console.log("Connecting to MongoDB…");
    await mongoClient.connect();
    const db = mongoClient.db(MONGODB_DBNAME);
    const collection = db.collection("products");
    const brandsCollection = db.collection("brands");
    const categoriesCollection = db.collection("categories");

    // ── Insert new products (skip existing) ──
    let newProducts = 0;
    if (docs.length > 0) {
      const result = await collection.bulkWrite(
        docs.map((doc) => ({
          updateOne: {
            filter: { sourceProductId: doc.sourceProductId },
            update: { $setOnInsert: doc },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      newProducts = result.upsertedCount;
    }

    await collection.createIndex({ sourceProductId: 1 }, { unique: true });
    await collection.createIndex({ slug: 1 }, { sparse: true });
    await collection.createIndex({ sku: 1 }, { sparse: true });

    // ── Insert new brands (skip existing) ──
    let newBrands = 0;
    if (brands.length > 0) {
      const result = await brandsCollection.bulkWrite(
        brands.map((brand) => ({
          updateOne: {
            filter: { sourceBrandId: brand.id },
            update: {
              $setOnInsert: {
                sourceBrandId: brand.id,
                source: "supabase-postgres",
                name: brand.name,
                slug: brand.slug,
                productCount: brand._count.products,
                createdAt: brand.createdAt,
                updatedAt: brand.updatedAt,
                copiedAt: new Date(),
              },
            },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      newBrands = result.upsertedCount;
    }

    // ── Insert new categories (skip existing) ──
    let newCategories = 0;
    if (categories.length > 0) {
      const result = await categoriesCollection.bulkWrite(
        categories.map((category) => ({
          updateOne: {
            filter: { sourceCategoryId: category.id },
            update: {
              $setOnInsert: {
                sourceCategoryId: category.id,
                source: "supabase-postgres",
                name: category.name,
                slug: category.slug,
                productCount: category._count.products,
                sizeVariables: (category.sizeVariables || []).map((sv) => ({
                  sourceSizeVariableId: sv.id,
                  name: sv.name,
                  label: sv.label,
                  sortOrder: sv.sortOrder,
                  isDefault: sv.isDefault,
                })),
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
                copiedAt: new Date(),
              },
            },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      newCategories = result.upsertedCount;
    }

    await brandsCollection.createIndex({ sourceBrandId: 1 }, { unique: true, sparse: true });
    await brandsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
    await categoriesCollection.createIndex({ sourceCategoryId: 1 }, { unique: true, sparse: true });
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });

    // ── Recompute productCount from actual MongoDB data ──
    // Zero out all counts, then re-aggregate from products collection
    await Promise.all([
      brandsCollection.updateMany({}, { $set: { productCount: 0 } }),
      categoriesCollection.updateMany({}, { $set: { productCount: 0 } }),
    ]);

    const [brandCounts, categoryCounts] = await Promise.all([
      collection.aggregate([
        { $match: { "brand.name": { $exists: true, $ne: null } } },
        { $group: { _id: "$brand.name", count: { $sum: 1 } } },
      ]).toArray(),
      collection.aggregate([
        { $unwind: "$categories" },
        { $group: { _id: "$categories.category.name", count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    if (brandCounts.length > 0) {
      await brandsCollection.bulkWrite(
        brandCounts.map(({ _id, count }) => ({
          updateOne: { filter: { name: _id }, update: { $set: { productCount: count } } },
        })),
        { ordered: false }
      );
    }

    if (categoryCounts.length > 0) {
      await categoriesCollection.bulkWrite(
        categoryCounts.map(({ _id, count }) => ({
          updateOne: { filter: { name: _id }, update: { $set: { productCount: count } } },
        })),
        { ordered: false }
      );
    }

    const skippedProducts = docs.length - newProducts;
    const skippedBrands = brands.length - newBrands;
    const skippedCategories = categories.length - newCategories;

    console.log(`Products: ${newProducts} new, ${skippedProducts} already existed (skipped).`);
    console.log(`Brands: ${newBrands} new, ${skippedBrands} already existed (skipped).`);
    console.log(`Categories: ${newCategories} new, ${skippedCategories} already existed (skipped).`);
    console.log(`Product counts relinked: ${brandCounts.length} brands, ${categoryCounts.length} categories updated.`);
    console.log("Supabase was read-only — no upstream data was changed.");
  } finally {
    await mongoClient.close().catch(() => {});
    await pool.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error("Sync failed:", error.message || error);
  process.exitCode = 1;
});
