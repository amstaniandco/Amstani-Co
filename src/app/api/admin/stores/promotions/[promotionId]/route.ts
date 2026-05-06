import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { requireAdminResponse } from "../../../../../../lib/admin-catalog-taxonomy";

type Ctx = { params: Promise<{ promotionId: string }> };

// PATCH — update end date (and optionally imageUrl) of an existing promotion
export async function PATCH(req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { promotionId } = await params;
  const body = await req.json();

  let objId: ObjectId;
  try {
    objId = new ObjectId(promotionId);
  } catch {
    return NextResponse.json({ error: "Invalid promotionId" }, { status: 400 });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (body.endDate) update.endDate = body.endDate;
  if (body.imageUrl !== undefined) update.imageUrl = body.imageUrl;

  const client = await clientPromise;
  const result = await client
    .db(DB_NAME)
    .collection("promotions")
    .updateOne({ _id: objId }, { $set: update });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — remove a promotion
export async function DELETE(_req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { promotionId } = await params;

  let objId: ObjectId;
  try {
    objId = new ObjectId(promotionId);
  } catch {
    return NextResponse.json({ error: "Invalid promotionId" }, { status: 400 });
  }

  const client = await clientPromise;
  await client.db(DB_NAME).collection("promotions").deleteOne({ _id: objId });

  return NextResponse.json({ ok: true });
}
