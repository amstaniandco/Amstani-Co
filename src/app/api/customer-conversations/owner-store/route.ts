import { NextResponse } from "next/server";
import { ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

function mapThread(chat: WithId<Document>) {
  return {
    _id: chat._id.toString(),
    storeId: (chat.storeId as ObjectId).toString(),
    customerId: (chat.customerId as ObjectId).toString(),
    customerName: (chat.customerName as string) ?? "Customer",
    lastMessage: (chat.lastMessage as string) ?? "",
    lastSender: (chat.lastSender as string) ?? "",
    updatedAt: chat.updatedAt as Date,
  };
}

export async function GET() {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const chats = await db
    .collection("customer_chats")
    .find({ storeId: store._id })
    .sort({ updatedAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({
    storeId: store._id.toString(),
    storeName: (store.name as string) ?? "My Store",
    chats: chats.map(mapThread),
  });
}
