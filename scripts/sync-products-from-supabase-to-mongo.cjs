const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");
const { MongoClient } = require("mongodb");

const SOURCE_PROJECT = process.env.SOURCE_PROJECT || "C:\\Development\\As\\amstani-ws";
const SOURCE_PACKAGE = path.join(SOURCE_PROJECT, "package.json");
const SOURCE_ENV = path.join(SOURCE_PROJECT, ".env");
const LOCAL_ENV = path.join(process.cwd(), ".env");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const env = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[match[1]] = value;
  }

  return env;
}

function requireSourcePackage(packageName) {
  return createRequire(SOURCE_PACKAGE)(packageName);
}

function toStatus(isPublished) {
  return isPublished ? "active" : "draft";
}

function mapProduct(product) {
  const imageObjects = product.images.map((image) => ({
    id: image.id,
    imageUrl: image.imageUrl,
    alt: image.alt ?? null,
    isMain: image.isMain,
    sortOrder: image.sortOrder,
    createdAt: image.createdAt,
  }));
  const imageUrls = [
    product.mainImage,
    ...imageObjects.map((image) => image.imageUrl),
  ].filter(Boolean);
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
      category: {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
      },
    })),
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
        }
      : undefined,

    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color ?? undefined,
      sku: variant.skuVariant,
      stock: variant.stockQuantity,
      priceModifier:
        variant.priceOverride == null ? undefined : variant.priceOverride - product.price,
      priceOverride: variant.priceOverride ?? null,
      stockQuantity: variant.stockQuantity,
      skuVariant: variant.skuVariant,
      isCustomSize: variant.isCustomSize,
    })),
    sizeChart: product.sizeChart.map((chart) => ({
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

async function main() {
  if (!fs.existsSync(SOURCE_PACKAGE)) {
    throw new Error(`Source project not found at ${SOURCE_PROJECT}`);
  }

  const sourceEnv = parseEnvFile(SOURCE_ENV);
  const localEnv = parseEnvFile(LOCAL_ENV);

  process.env.DATABASE_URL = process.env.DATABASE_URL || sourceEnv.DATABASE_URL;
  process.env.DIRECT_URL = process.env.DIRECT_URL || sourceEnv.DIRECT_URL;

  const mongoUri =
    process.env.MONGODB_URI ||
    localEnv.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/amstani";
  const mongoDbName = process.env.MONGODB_DBNAME || localEnv.MONGODB_DBNAME || "amstani";
  const collectionName = process.env.MONGODB_PRODUCTS_COLLECTION || "products";
  const dryRun = process.argv.includes("--dry-run");

  const { PrismaClient } = requireSourcePackage("@prisma/client");
  const prisma = new PrismaClient({ log: [] });
  const mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 10000 });

  try {
    const [brands, categories, products] = await Promise.all([
      prisma.brand.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          sizeVariables: { orderBy: { sortOrder: "asc" } },
          _count: { select: { products: true } },
        },
      }),
      prisma.product.findMany({
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        categories: {
          orderBy: { isPrimary: "desc" },
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        sizeChart: true,
        shipping: true,
      },
      orderBy: { createdAt: "asc" },
      }),
    ]);

    const docs = products.map(mapProduct);

    console.log(`Read ${docs.length} products from Supabase/Postgres.`);
    console.log(`Read ${brands.length} brands and ${categories.length} categories from Supabase/Postgres.`);
    console.log(`Target MongoDB database: ${mongoDbName}, collection: ${collectionName}.`);

    if (dryRun) {
      const imageCount = docs.reduce((total, product) => total + product.imageUrls.length, 0);
      console.log(`Dry run only. Found ${docs.length} products (${imageCount} image URLs) in Supabase.`);
      console.log(`Dry run only. Found ${brands.length} brands and ${categories.length} categories in Supabase.`);
      console.log(`Only items not already in MongoDB would be inserted (existing ones are never modified).`);
      return;
    }

    await mongoClient.connect();
    const db = mongoClient.db(mongoDbName);
    const collection = db.collection(collectionName);
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
                sizeVariables: category.sizeVariables.map((variable) => ({
                  sourceSizeVariableId: variable.id,
                  name: variable.name,
                  label: variable.label,
                  sortOrder: variable.sortOrder,
                  isDefault: variable.isDefault,
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

    // Recompute productCount for brands and categories from actual MongoDB products
    // Uses name-based matching so UI-added and Supabase-sourced products both count
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
          updateOne: {
            filter: { name: _id },
            update: { $set: { productCount: count } },
          },
        })),
        { ordered: false }
      );
    }

    if (categoryCounts.length > 0) {
      await categoriesCollection.bulkWrite(
        categoryCounts.map(({ _id, count }) => ({
          updateOne: {
            filter: { name: _id },
            update: { $set: { productCount: count } },
          },
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
    console.log("Supabase/Postgres was read only; no upstream rows, files, or images were changed.");
  } finally {
    await mongoClient.close().catch(() => {});
    await prisma.$disconnect().catch(() => {});
  }
}

main().catch((error) => {
  console.error("Product sync failed:", error.message || error);
  process.exitCode = 1;
});
