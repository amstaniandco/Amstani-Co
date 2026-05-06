import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { requireAdminResponse } from "../../../../../../lib/admin-catalog-taxonomy";

type Ctx = { params: Promise<{ storeId: string }> };

// GET — fetch all listing requests for this store
export async function GET(_req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { storeId } = await params;
  const client = await clientPromise;
  const requests = await client
    .db(DB_NAME)
    .collection("listing_requests")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ requests });
}
