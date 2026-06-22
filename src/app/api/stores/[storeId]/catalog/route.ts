import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  if (!storeId) return NextResponse.json({ products: [] });

  const client = await clientPromise;
  const products = await client
    .db(DB_NAME)
    .collection("owner_catalog")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ products });
}
