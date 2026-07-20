import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { resolveEffectivePricingRule } from "../../../../../lib/pricing-config";

const CONFIG_ID = "pricing_config";

export async function PATCH(req: Request, { params }: { params: Promise<{ productId: string }> }) {
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

  const entry = await db.collection("owner_catalog").findOne({ storeId, productId });
  if (!entry) return NextResponse.json({ error: "Product not found in catalog" }, { status: 404 });

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

  // Fetch adminAdjustedPrice from global product — use it as the cap base
  let adminAdjustedPrice: number | null = null;
  if (ObjectId.isValid(productId)) {
    const gp = await db.collection("products").findOne(
      { _id: new ObjectId(productId) },
      { projection: { adminAdjustedPrice: 1 } }
    );
    adminAdjustedPrice = (gp?.adminAdjustedPrice as number) ?? null;
  }

  const catalogBase = adminAdjustedPrice ?? (entry.originalPrice as number) ?? 0;
  const maxPrice = catalogBase * (1 + markupPercent / 100);

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.price === "number") {
    if (body.price < 0) return NextResponse.json({ error: "Price cannot be negative." }, { status: 400 });
    if (body.price > maxPrice) return NextResponse.json({ error: `Price cannot exceed $${maxPrice.toFixed(2)}.` }, { status: 400 });
    updates.price = Math.round(body.price * 100) / 100;
  }

  if (typeof body.discountPercent === "number") {
    const dp = Math.round(body.discountPercent * 100) / 100;
    if (dp < 0 || dp > discountCap) return NextResponse.json({ error: `Discount cannot exceed ${discountCap}%.` }, { status: 400 });
    updates.discountPercent = dp;
  }

  if (typeof body.isOnSale === "boolean") {
    updates.isOnSale = body.isOnSale;
    if (!body.isOnSale) updates.discountPercent = 0;
  }

  await db.collection("owner_catalog").updateOne({ storeId, productId }, { $set: updates });
  return NextResponse.json({ ok: true });
}
