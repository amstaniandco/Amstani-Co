import { NextRequest, NextResponse } from "next/server";
import { ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

type Params = { params: Promise<{ storeId: string; messageId: string }> };

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

export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId, messageId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "user" && user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!ObjectId.isValid(storeId) || !ObjectId.isValid(messageId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const storeObjectId = new ObjectId(storeId);
  const messageObjectId = new ObjectId(messageId);

  if (user.role === "owner") {
    const store = await db.collection("stores").findOne({
      _id: storeObjectId,
      ownerId: new ObjectId(user.id),
    });
    if (!store) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await db.collection("customer_messages").findOne({
    _id: messageObjectId,
    storeId: storeObjectId,
  });
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((message.senderId as ObjectId).toString() !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, text } = await req.json();
  const now = new Date();

  if (action === "delete") {
    await db.collection("customer_messages").updateOne(
      { _id: messageObjectId },
      { $set: { deleted: true, content: "", updatedAt: now } }
    );
    await db.collection("customer_chats").updateOne(
      { _id: message.chatId as ObjectId, lastMessage: message.content },
      { $set: { lastMessage: "This message was deleted", updatedAt: now } }
    );
  } else if (action === "edit") {
    if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });
    await db.collection("customer_messages").updateOne(
      { _id: messageObjectId },
      { $set: { content: text.trim() as string, edited: true, updatedAt: now } }
    );
    await db.collection("customer_chats").updateOne(
      { _id: message.chatId as ObjectId, lastMessage: message.content },
      { $set: { lastMessage: text.trim() as string, updatedAt: now } }
    );
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await db.collection("customer_messages").findOne({ _id: messageObjectId });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ message: mapMessage(updated) });
}
