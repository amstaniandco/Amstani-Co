import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { requireAdminResponse, slugify } from "../../../../../../lib/admin-catalog-taxonomy";

function toObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
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

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const { id } = await context.params;
    const objectId = toObjectId(id);
    if (!objectId) return NextResponse.json({ error: "Invalid brand id" }, { status: 400 });

    const client = await clientPromise;
    const result = await client.db(DB_NAME).collection("brands").deleteOne({ _id: objectId });
    if (!result.deletedCount) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    return NextResponse.json({ message: "Brand deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/global-catalog/brands/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
