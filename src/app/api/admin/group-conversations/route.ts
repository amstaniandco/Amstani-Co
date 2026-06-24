import { NextRequest, NextResponse } from "next/server";
import { ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

function mapMessage(message: WithId<Document>) {
  return {
    _id: message._id.toString(),
    sender: message.senderRole as "customer" | "owner",
    senderName: message.senderName as string,
    senderId: (message.senderId as ObjectId)?.toString(),
    text: message.content as string,
    createdAt: message.createdAt as Date,
    deleted: (message.deleted as boolean) ?? false,
    edited: (message.edited as boolean) ?? false,
    replyTo: (message.replyTo as { _id: string; senderName: string; text: string; deleted?: boolean } | undefined) ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const storeId = req.nextUrl.searchParams.get("storeId");

  if (storeId) {
    if (!ObjectId.isValid(storeId)) {
      return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });
    }

    const storeObjectId = new ObjectId(storeId);
    const store = await db.collection("stores").findOne({ _id: storeObjectId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const messages = await db
      .collection("store_group_messages")
      .find({ storeId: storeObjectId })
      .sort({ createdAt: 1 })
      .limit(200)
      .toArray();

    return NextResponse.json({
      store: { _id: storeObjectId.toString(), name: (store.name as string) ?? "Store" },
      messages: messages.map(mapMessage),
    });
  }

  const stores = await db
    .collection("store_group_messages")
    .aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$storeId", lastMessage: { $first: "$content" }, updatedAt: { $first: "$createdAt" } } },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
      { $sort: { updatedAt: -1 } },
      { $limit: 100 },
    ])
    .toArray();

  return NextResponse.json({
    stores: stores.map((s) => ({
      _id: (s._id as ObjectId).toString(),
      storeName: (s.store?.name as string) ?? "Store",
      lastMessage: (s.lastMessage as string) ?? "",
      updatedAt: s.updatedAt as Date,
    })),
  });
}
