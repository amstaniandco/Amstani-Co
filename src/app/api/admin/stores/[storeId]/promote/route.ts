import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { requireAdminResponse } from "../../../../../../lib/admin-catalog-taxonomy";

type Ctx = { params: Promise<{ storeId: string }> };

// POST — promote a store (creates or replaces its active promotion)
export async function POST(req: Request, { params }: Ctx) {
  const authError = await requireAdminResponse();
  if (authError) return authError;

  const { storeId } = await params;
  const { imageUrl, mediaType, endDate } = await req.json();

  if (!endDate) {
    return NextResponse.json({ error: "endDate is required" }, { status: 400 });
  }

  let storeObjId: ObjectId;
  try {
    storeObjId = new ObjectId(storeId);
  } catch {
    return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // Load store + owner for denormalized display fields
  const [store] = await db
    .collection("stores")
    .aggregate([
      { $match: { _id: storeObjId } },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          "owner.email": 1,
          "owner.state": 1,
        },
      },
    ])
    .toArray();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const now = new Date();
  const result = await db.collection("promotions").insertOne({
    storeId,
    storeName: store.name,
    storeEmail: store.owner?.email ?? "",
    storeState: store.owner?.state ?? "",
    imageUrl: imageUrl ?? null,
    mediaType: mediaType === "video" ? "video" : "image",
    endDate,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ ok: true, promotionId: result.insertedId }, { status: 201 });
}
