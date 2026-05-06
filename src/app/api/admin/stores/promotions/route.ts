import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { requireAdminResponse } from "../../../../../lib/admin-catalog-taxonomy";

export async function GET() {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const client = await clientPromise;
  const promotions = await client
    .db(DB_NAME)
    .collection("promotions")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ promotions });
}
