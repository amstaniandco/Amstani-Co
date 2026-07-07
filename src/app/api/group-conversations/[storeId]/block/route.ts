import { NextRequest, NextResponse } from "next/server";
import { ObjectId, UpdateFilter, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { fetchBlockedUsers } from "../../../../../lib/blockedUsers";

type Params = { params: Promise<{ storeId: string }> };

// Owner-only: block or unblock a customer from this store's group chat.
export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ObjectId.isValid(storeId)) return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });

  const { userId, action } = await req.json();
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }
  if (action !== "block" && action !== "unblock") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const storeObjectId = new ObjectId(storeId);

  const store = await db.collection("stores").findOne({ _id: storeObjectId });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  if ((store.ownerId as ObjectId)?.toString() !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetId = new ObjectId(userId);
  // An owner can never block themselves.
  if ((store.ownerId as ObjectId)?.toString() === userId) {
    return NextResponse.json({ error: "Cannot block the store owner" }, { status: 400 });
  }

  const update = (
    action === "block"
      ? { $addToSet: { blockedUserIds: targetId }, $set: { updatedAt: new Date() } }
      : { $pull: { blockedUserIds: targetId }, $set: { updatedAt: new Date() } }
  ) as UpdateFilter<Document>;

  await db.collection("stores").updateOne({ _id: storeObjectId }, update);

  const updated = await db.collection("stores").findOne({ _id: storeObjectId });
  const blockedObjectIds = (updated?.blockedUserIds as ObjectId[]) ?? [];
  const blockedUserIds = blockedObjectIds.map((id) => id.toString());
  const blockedUsers = await fetchBlockedUsers(db, blockedObjectIds);

  return NextResponse.json({ blockedUserIds, blockedUsers });
}
