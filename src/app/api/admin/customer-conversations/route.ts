import { NextRequest, NextResponse } from "next/server";
import { ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

function mapThread(chat: Document) {
  return {
    _id: (chat._id as ObjectId).toString(),
    storeId: (chat.storeId as ObjectId).toString(),
    customerId: (chat.customerId as ObjectId).toString(),
    customerName: (chat.customerName as string) ?? "Customer",
    storeName: (chat.storeName as string) ?? (chat.store?.name as string) ?? "Store",
    lastMessage: (chat.lastMessage as string) ?? "",
    lastSender: (chat.lastSender as string) ?? "",
    updatedAt: chat.updatedAt as Date,
  };
}

function mapMessage(message: WithId<Document>) {
  return {
    _id: message._id.toString(),
    sender: message.senderRole as "customer" | "owner",
    senderName: message.senderName as string,
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
  const chatId = req.nextUrl.searchParams.get("chatId");

  if (chatId) {
    if (!ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
    }

    const chat = await db.collection("customer_chats").findOne({ _id: new ObjectId(chatId) });
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    const messages = await db
      .collection("customer_messages")
      .find({ chatId: chat._id })
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      chat: mapThread(chat),
      messages: messages.map(mapMessage),
    });
  }

  const chats = await db
    .collection("customer_chats")
    .aggregate([
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
      { $sort: { updatedAt: -1 } },
      { $limit: 100 },
    ])
    .toArray();

  return NextResponse.json({ chats: chats.map(mapThread) });
}
