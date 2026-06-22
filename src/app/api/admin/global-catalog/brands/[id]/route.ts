import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { requireAdminResponse, slugify } from "../../../../../../lib/admin-catalog-taxonomy";
import { recomputeCatalogCounts } from "../../../../../../lib/catalog-counts";

function toObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/**
 * Build a MongoDB filter that finds all products belonging to a brand.
 * Supabase-sourced brands link via brand.id ↔ sourceBrandId (UUID).
 * Admin-created brands have no sourceBrandId, so fall back to name matching.
 */
function brandProductFilter(brand: { name: string; sourceBrandId?: string }) {
  if (brand.sourceBrandId) {
    return { $or: [{ "brand.id": brand.sourceBrandId }, { "brand.name": brand.name }] };
  }
  return { "brand.name": brand.name };
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const { id } = await context.params;
    const objectId = toObjectId(id);
    if (!objectId) return NextResponse.json({ error: "Invalid brand id" }, { status: 400 });

    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Brand name is required" }, { status: 400 });

    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection("brands");
    const slug = slugify(body.slug || name);
    const duplicate = await collection.findOne({ _id: { $ne: objectId }, $or: [{ name }, { slug }] });
    if (duplicate) return NextResponse.json({ error: "Brand already exists" }, { status: 409 });

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: { name, slug, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    return NextResponse.json({ brand: result }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/global-catalog/brands/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Suspend or activate a brand — hides/shows all its products everywhere
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const { id } = await context.params;
    const objectId = toObjectId(id);
    if (!objectId) return NextResponse.json({ error: "Invalid brand id" }, { status: 400 });

    const body = await req.json();
    const action = body.action as string;
    if (action !== "suspend" && action !== "activate") {
      return NextResponse.json({ error: "action must be 'suspend' or 'activate'" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const brand = await db.collection("brands").findOne({ _id: objectId });
    if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    const newStatus = action === "suspend" ? "suspended" : "active";
    const brandSuspended = action === "suspend";

    await db.collection("brands").updateOne(
      { _id: objectId },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );

    await db.collection("products").updateMany(
      brandProductFilter(brand as unknown as { name: string; sourceBrandId?: string }),
      { $set: { brandSuspended, updatedAt: new Date() } }
    );

    const updated = await db.collection("brands").findOne({ _id: objectId });
    return NextResponse.json({ brand: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/global-catalog/brands/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Cascade delete: removes brand + all its products from every collection
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const { id } = await context.params;
    const objectId = toObjectId(id);
    if (!objectId) return NextResponse.json({ error: "Invalid brand id" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const brand = await db.collection("brands").findOne({ _id: objectId });
    if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    const filter = brandProductFilter(brand as unknown as { name: string; sourceBrandId?: string });

    const brandProducts = await db
      .collection("products")
      .find(filter)
      .project({ _id: 1 })
      .toArray();

    const productIds = brandProducts.map((p) => p._id.toString());

    if (productIds.length > 0) {
      await Promise.all([
        db.collection("store_products").deleteMany({ productId: { $in: productIds } }),
        db.collection("owner_catalog").deleteMany({ productId: { $in: productIds } }),
        db.collection("products").deleteMany(filter),
      ]);
    }

    await db.collection("brands").deleteOne({ _id: objectId });
    await recomputeCatalogCounts(db);

    return NextResponse.json({ message: "Brand deleted", deletedProducts: productIds.length }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/global-catalog/brands/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
