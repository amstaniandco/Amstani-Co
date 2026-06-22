import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

const CONFIG_ID = "pricing_config";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { productId } = await params;
  const body = await req.json();

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const storeId = store._id.toString();

  const storeProduct = await db
    .collection("store_products")
    .findOne({ storeId, productId });
  if (!storeProduct) return NextResponse.json({ error: "Product not found in your store" }, { status: 404 });

  // Load pricing rules
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = await db.collection("pricing_config").findOne({ _id: CONFIG_ID as any });
  const markupPercent: number = config?.markupPercent ?? 20;
  const discountCap: number = config?.discountCap ?? 20;

  const originalPrice: number = storeProduct.originalPrice ?? storeProduct.price ?? 0;
  const maxSellingPrice = originalPrice * (1 + markupPercent / 100);

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  // Validate and apply sellingPrice
  if (typeof body.sellingPrice === "number") {
    const sp = Number(body.sellingPrice.toFixed(2));
    if (sp < 0) {
      return NextResponse.json({ error: "Selling price cannot be negative." }, { status: 400 });
    }
    if (sp > maxSellingPrice) {
      return NextResponse.json({
        error: `Selling price cannot exceed $${maxSellingPrice.toFixed(2)} (original $${originalPrice.toFixed(2)} + ${markupPercent}% markup).`,
      }, { status: 400 });
    }
    updates.sellingPrice = sp;
    updates.price = sp; // keep price field in sync for backwards compat
  }

  // Validate and apply discountPercent
  if (typeof body.discountPercent === "number") {
    const dp = Math.round(body.discountPercent * 100) / 100;
    if (dp < 0 || dp > discountCap) {
      return NextResponse.json({
        error: `Discount cannot exceed ${discountCap}% (platform limit).`,
      }, { status: 400 });
    }
    updates.discountPercent = dp;
  }

  // Toggle sale
  if (typeof body.isOnSale === "boolean") {
    updates.isOnSale = body.isOnSale;
    if (!body.isOnSale) updates.discountPercent = 0;
  }

  // Toggle new arrival tag
  if (typeof body.isNewArrival === "boolean") {
    updates.isNewArrival = body.isNewArrival;
  }

  await db.collection("store_products").updateOne(
    { storeId, productId },
    { $set: updates }
  );

  return NextResponse.json({ ok: true, updates });
}
