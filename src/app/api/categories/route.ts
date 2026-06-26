import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const categories = await client
      .db(DB_NAME)
      .collection("categories")
      .find({})
      .sort({ name: 1 })
      .project({ _id: 1, name: 1, slug: 1, imageUrl: 1, productCount: 1 })
      .toArray();

    return NextResponse.json({ categories }, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ categories: [] });
  }
}
