import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { requireAdminResponse } from "../../../../../../lib/admin-catalog-taxonomy";

type Ctx = { params: Promise<{ storeId: string }> };

// GET  — list products currently listed for this store
export async function GET(_req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { storeId } = await params;
  const client = await clientPromise;
  const rows = await client
    .db(DB_NAME)
    .collection("store_products")
    .find({ storeId })
    .sort({ listedAt: -1 })
    .toArray();

  return NextResponse.json({ products: rows });
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
              sellingPrice: originalPrice,
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
