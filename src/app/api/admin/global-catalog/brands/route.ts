import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { requireAdminResponse, slugify } from "../../../../../lib/admin-catalog-taxonomy";

export async function GET(req: Request) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const query = q ? { name: { $regex: q, $options: "i" } } : {};

    const client = await clientPromise;
    const brands = await client.db(DB_NAME).collection("brands").find(query).sort({ name: 1 }).limit(500).toArray();

    return NextResponse.json({ brands }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/global-catalog/brands error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdminResponse();
    if (authError) return authError;

    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Brand name is required" }, { status: 400 });

    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection("brands");
    const slug = slugify(body.slug || name);
    const duplicate = await collection.findOne({ $or: [{ name }, { slug }] });
    if (duplicate) return NextResponse.json({ error: "Brand already exists" }, { status: 409 });

    const now = new Date();
    const result = await collection.insertOne({
      name,
      slug,
      source: "admin",
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ brand: { _id: result.insertedId, name, slug, productCount: 0 } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/global-catalog/brands error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
