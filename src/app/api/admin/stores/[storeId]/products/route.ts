import { NextResponse } from "next/server";
import { ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { requireAdminResponse } from "../../../../../../lib/admin-catalog-taxonomy";

type Ctx = { params: Promise<{ storeId: string }> };

// GET  — list products currently listed for this store
export async function GET(_req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { storeId } = await params;
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const rows = await db
    .collection("store_products")
    .find({ storeId })
    .sort({ listedAt: -1 })
    .toArray();

  // Enrich with brand/category/description from global catalog
  const productIds = rows
    .map((r) => { try { return new ObjectId(r.productId as string); } catch { return null; } })
    .filter(Boolean) as ObjectId[];

  const catalogDocs = productIds.length
    ? await db.collection("products")
        .find({ _id: { $in: productIds } })
        .project({ _id: 1, brand: 1, category: 1, description: 1, isPublished: 1, status: 1, brandSuspended: 1, isSuspended: 1 })
        .toArray()
    : [];

  const catalogMap = new Map(
    (catalogDocs as WithId<Document>[]).map((d) => [d._id.toString(), d])
  );

  const enriched = rows
    .filter((r) => {
      const cat = catalogMap.get(r.productId as string);
      if (!cat) return false; // removed from global catalog
      if (cat.isPublished === false) return false;
      if (cat.status === "archived" || cat.status === "draft") return false;
      if (cat.brandSuspended === true || cat.isSuspended === true) return false;
      return true;
    })
    .map((r) => {
      const cat = catalogMap.get(r.productId as string);
      return {
        ...r,
        brand: (cat?.brand as { name?: string } | undefined)?.name ?? null,
        category: (cat?.category as string | undefined) ?? null,
        description: (cat?.description as string | undefined) ?? null,
      };
    });

  return NextResponse.json({ products: enriched });
}

// POST — add selected global-catalog products to this store
export async function POST(req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { storeId } = await params;
  const body = await req.json();
  // body.items: Array<{ productId: string; quantity: number }>

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const globalProducts = db.collection("products");
  const storeProducts = db.collection("store_products");

  // Fetch the actual product details from global catalog
  const productIds = body.items.map((i: { productId: string }) => {
    try { return new ObjectId(i.productId); } catch { return null; }
  }).filter(Boolean);

  const foundProducts = await globalProducts
    .find({ _id: { $in: productIds } })
    .toArray();

  const productMap = new Map(foundProducts.map((p) => [p._id.toString(), p]));

  const now = new Date();
  const ops = body.items
    .map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      const originalPrice = Number(product.price ?? 0);
      return {
        updateOne: {
          filter: { storeId, productId: item.productId },
          update: {
            $set: {
              storeId,
              productId: item.productId,
              name: product.name,
              sku: product.sku ?? "",
              originalPrice,
              price: originalPrice,        // kept for backwards compat
              mainImage: product.mainImage ?? null,
              quantity: Number(item.quantity) || 1,
              updatedAt: now,
            },
            // Only set these on first insert (owner can change them later)
            $setOnInsert: {
              listedAt: now,
              sellingPrice: null,   // null = fall back to adminAdjustedPrice automatically
              discountPercent: 0,
              isOnSale: false,
              isNewArrival: false,
            },
          },
          upsert: true,
        },
      };
    })
    .filter(Boolean);

  if (ops.length === 0) {
    return NextResponse.json({ error: "No valid products found in catalog" }, { status: 404 });
  }

  await storeProducts.bulkWrite(ops, { ordered: false });
  return NextResponse.json({ ok: true, listed: ops.length });
}

// DELETE — remove a product from this store
export async function DELETE(req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { storeId } = await params;
  const { productId } = await req.json();

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const client = await clientPromise;
  await client.db(DB_NAME).collection("store_products").deleteOne({ storeId, productId });

  return NextResponse.json({ ok: true });
}
