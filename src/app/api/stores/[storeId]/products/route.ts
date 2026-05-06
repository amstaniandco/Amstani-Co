import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

type Ctx = { params: Promise<{ storeId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { storeId } = await params;

  const client = await clientPromise;
  const products = await client
    .db(DB_NAME)
    .collection("store_products")
    .find({ storeId })
    .sort({ listedAt: -1 })
    .toArray();

  return NextResponse.json({ products });
}
