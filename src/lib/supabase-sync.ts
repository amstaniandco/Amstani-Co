import { Pool } from "pg";
import { MongoClient } from "mongodb";

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

  const imagesByProduct = groupById(images, "productId");
  const catsByProduct = groupById(productCategories, "productId");
  const variantsByProduct = groupById(variants, "productId");
  const sizeChartsByProduct = groupById(sizeCharts, "productId");
  const shippingByProduct: Record<string, typeof shippings[0]> = {};
  for (const s of shippings) shippingByProduct[s.productId] = s;

  const sizeVarsByCategory = groupById(sizeVariables, "categoryId");

  const brandProductCount: Record<string, number> = {};
  for (const p of products) {
    if (p.brandId) brandProductCount[p.brandId] = (brandProductCount[p.brandId] || 0) + 1;
  }

  const categoryProductCount: Record<string, number> = {};
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
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
      .map((pc: Record<string, unknown>) => ({
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

function toStatus(isPublished: boolean) {
  return isPublished ? "active" : "draft";
}

function mapProduct(product: Record<string, unknown>) {
  const images = (product.images as Record<string, unknown>[] || []);
  const imageObjects = images.map((image) => ({
    id: image.id,
    imageUrl: image.imageUrl,
    alt: image.alt ?? null,
    isMain: image.isMain,
    sortOrder: image.sortOrder,
    createdAt: image.createdAt,
  }));
  const imageUrls = [
    product.mainImage as string,
    ...imageObjects.map((i) => i.imageUrl as string),
  ].filter(Boolean);
  const uniqueImageUrls = Array.from(new Set(imageUrls));

  const categories = product.categories as Array<{ isPrimary: boolean; categoryId: string; category: { id: string; name: string; slug: string } }>;
  const primaryCategory =
    categories.find((item) => item.isPrimary)?.category ??
    categories[0]?.category ??
    null;

  const brand = product.brand as Record<string, unknown> | null;
  const variants = (product.variants as Record<string, unknown>[] || []);
  const sizeChart = (product.sizeChart as Record<string, unknown>[] || []);
  const shipping = product.shipping as Record<string, unknown> | null;

  return {
    sourceProductId: product.id,
    source: "supabase-postgres",
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: (product.shortDescription ?? product.fullDescription) as string | null,
    shortDescription: (product.shortDescription ?? null) as string | null,
    fullDescription: product.fullDescription,
    price: product.price,
    compareAtPrice: (product.compareAtPrice ?? null) as number | null,
    costPrice: (product.costPrice ?? null) as number | null,
    stock: product.totalStock,
    totalStock: product.totalStock,
    stockStatus: product.stockStatus,
    imageUrls: uniqueImageUrls,
    images: imageObjects,
    mainImage: (product.mainImage ?? uniqueImageUrls[0] ?? null) as string | null,
    category: primaryCategory?.name ?? "",
    categories: categories.map((item) => ({
      categoryId: item.categoryId,
      isPrimary: item.isPrimary,
      category: { id: item.category.id, name: item.category.name, slug: item.category.slug },
    })),
    brand: brand
      ? { id: brand.id, name: brand.name, slug: brand.slug }
      : undefined,
    variants: variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color ?? undefined,
      sku: v.skuVariant,
      priceModifier: v.priceOverride == null ? undefined : (v.priceOverride as number) - (product.price as number),
      priceOverride: (v.priceOverride ?? null) as number | null,
      stock: v.stockQuantity,
      stockQuantity: v.stockQuantity,
      skuVariant: v.skuVariant,
      isCustomSize: v.isCustomSize,
    })),
    sizeChart: sizeChart.map((chart) => ({
      id: chart.id,
      size: chart.size,
      measurements: chart.measurements,
      unit: chart.unit,
    })),
    shipping: shipping
      ? {
          productId: shipping.productId,
          weight: (shipping.weight ?? null) as number | null,
          dimensionL: (shipping.dimensionL ?? null) as number | null,
          dimensionW: (shipping.dimensionW ?? null) as number | null,
          dimensionH: (shipping.dimensionH ?? null) as number | null,
          shippingClass: (shipping.shippingClass ?? null) as string | null,
        }
      : null,
    status: toStatus(product.isPublished as boolean),
    isFeatured: product.isFeatured,
    isPublished: product.isPublished,
    seoTitle: (product.seoTitle ?? null) as string | null,
    seoDescription: (product.seoDescription ?? null) as string | null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    copiedAt: new Date(),
  };
}

export type SyncResult = {
  newProducts: number;
  skippedProducts: number;
  newBrands: number;
  skippedBrands: number;
  newCategories: number;
  skippedCategories: number;
  brandCountsUpdated: number;
  categoryCountsUpdated: number;
  log: string[];
};

export async function runSupabaseSync(): Promise<SyncResult> {
  const SUPABASE_DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amstani";
  const MONGODB_DBNAME = process.env.MONGODB_DBNAME || "amstani";

  if (!SUPABASE_DATABASE_URL) {
    throw new Error("SUPABASE_DATABASE_URL is not configured");
  }

  const pool = new Pool({
    connectionString: SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const mongoClient = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    const { brands, categories, products } = await fetchFromSupabase(pool);
    const docs = products.map(mapProduct);

    await mongoClient.connect();
    const db = mongoClient.db(MONGODB_DBNAME);
    const collection = db.collection("products");
    const brandsCollection = db.collection("brands");
    const categoriesCollection = db.collection("categories");

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
                sizeVariables: (category.sizeVariables || []).map((sv: Record<string, unknown>) => ({
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

    await Promise.all([
      brandsCollection.updateMany({}, { $set: { productCount: 0 } }),
      categoriesCollection.updateMany({}, { $set: { productCount: 0 } }),
    ]);

    const [brandCounts, categoryCounts] = await Promise.all([
      collection.aggregate<{ _id: string; count: number }>([
        { $match: { "brand.name": { $exists: true, $ne: null } } },
        { $group: { _id: "$brand.name", count: { $sum: 1 } } },
      ]).toArray(),
      collection.aggregate<{ _id: string; count: number }>([
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

    return {
      newProducts,
      skippedProducts,
      newBrands,
      skippedBrands,
      newCategories,
      skippedCategories,
      brandCountsUpdated: brandCounts.length,
      categoryCountsUpdated: categoryCounts.length,
      log: [
        `Read ${docs.length} products, ${brands.length} brands, ${categories.length} categories from Supabase.`,
        `Products: ${newProducts} new, ${skippedProducts} already existed (skipped).`,
        `Brands: ${newBrands} new, ${skippedBrands} already existed (skipped).`,
        `Categories: ${newCategories} new, ${skippedCategories} already existed (skipped).`,
        `Product counts relinked: ${brandCounts.length} brands, ${categoryCounts.length} categories updated.`,
        "Supabase was read-only — no upstream data was changed.",
      ],
    };
  } finally {
    await mongoClient.close().catch(() => {});
    await pool.end().catch(() => {});
  }
}
