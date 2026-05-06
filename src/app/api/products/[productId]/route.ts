import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";

type Ctx = { params: Promise<{ productId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { productId } = await params;

  let id: ObjectId;
  try {
    id = new ObjectId(productId);
  } catch {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const client = await clientPromise;
  const product = await client.db(DB_NAME).collection("products").findOne({ _id: id });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json({ product });
}
