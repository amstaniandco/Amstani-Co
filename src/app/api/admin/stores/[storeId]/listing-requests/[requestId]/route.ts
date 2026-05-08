import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../../lib/db";
import { requireAdminResponse } from "../../../../../../../lib/admin-catalog-taxonomy";

type Ctx = { params: Promise<{ storeId: string; requestId: string }> };

// PATCH — approve or reject a listing request
export async function PATCH(req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { storeId, requestId } = await params;
  const { action } = await req.json(); // action: "approve" | "reject"

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  let requestObjId: ObjectId;
  try {
    requestObjId = new ObjectId(requestId);
  } catch {
    return NextResponse.json({ error: "Invalid requestId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const requestsCol = db.collection("listing_requests");

  const request = await requestsCol.findOne({ _id: requestObjId, storeId });
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.status !== "pending") {
    return NextResponse.json({ error: "Request already processed" }, { status: 409 });
  }

  const now = new Date();
  await requestsCol.updateOne(
    { _id: requestObjId },
    { $set: { status: action === "approve" ? "approved" : "rejected", updatedAt: now } }
  );

  // On approval, list the products in the store
  if (action === "approve" && Array.isArray(request.items) && request.items.length > 0) {
    const storeProducts = db.collection("store_products");
    const globalProducts = db.collection("products");

    // Items contain SKU codes (from Amstani Wholesale orders)
    const skus = request.items.map((i: { productId: string }) => i.productId);
    const found = await globalProducts.find({ sku: { $in: skus } }).toArray();
    const productMap = new Map(found.map((p) => [p.sku, p]));

    const ops = request.items
      .map((item: { productId: string; quantity: number }) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          updateOne: {
            filter: { storeId, productId: product._id.toString() },
            update: {
              $set: {
                storeId,
                productId: product._id.toString(),
                name: product.name,
                sku: product.sku ?? "",
                price: product.price,
                mainImage: product.mainImage ?? null,
                quantity: Number(item.quantity) || 1,
                updatedAt: now,
              },
              $setOnInsert: { listedAt: now },
            },
            upsert: true,
          },
        };
      })
      .filter((op): op is NonNullable<typeof op> => op !== null);

    if (ops.length > 0) {
      await storeProducts.bulkWrite(ops, { ordered: false });
    }
  }

  return NextResponse.json({ ok: true, status: action === "approve" ? "approved" : "rejected" });
}
