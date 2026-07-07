import { NextRequest, NextResponse } from "next/server";
import { Db, ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

type Params = { params: Promise<{ storeId: string }> };

function mapMessage(message: WithId<Document>) {
  return {
    _id: message._id.toString(),
    sender: message.senderRole as "customer" | "owner",
    senderName: message.senderName as string,
    senderAvatarUrl: (message.senderAvatarUrl as string | undefined) ?? undefined,
    reactions: (message.reactions as Record<string, string[]> | undefined) ?? {},
    text: message.content as string,
    createdAt: message.createdAt as Date,
    deleted: (message.deleted as boolean) ?? false,
    edited: (message.edited as boolean) ?? false,
    replyTo: (message.replyTo as { _id: string; senderName: string; text: string; deleted?: boolean } | undefined) ?? undefined,
  };
}

async function getOwnedStore(db: Db, userId: string, storeId: string) {
  if (!ObjectId.isValid(storeId)) return null;
  return db.collection("stores").findOne({
    _id: new ObjectId(storeId),
    ownerId: new ObjectId(userId),
  });
}

async function getCustomerChat(db: Db, storeId: string, customerId: string) {
  return db.collection("customer_chats").findOne({
    storeId: new ObjectId(storeId),
    customerId: new ObjectId(customerId),
  });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ObjectId.isValid(storeId)) return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  let chat: WithId<Document> | null = null;

  if (user.role === "owner") {
    const store = await getOwnedStore(db, user.id, storeId);
    if (!store) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const chatId = req.nextUrl.searchParams.get("chatId");
    if (!chatId || !ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "chatId required" }, { status: 400 });
    }
    chat = await db.collection("customer_chats").findOne({
      _id: new ObjectId(chatId),
      storeId: new ObjectId(storeId),
    });
  } else if (user.role === "user") {
    chat = await getCustomerChat(db, storeId, user.id);
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!chat) return NextResponse.json({ chat: null, messages: [] });

  const messages = await db
    .collection("customer_messages")
    .find({ chatId: chat._id })
    .sort({ createdAt: 1 })
    .limit(100)
    .toArray();

  const incomingRole = user.role === "owner" ? "customer" : "owner";
  await db.collection("customer_messages").updateMany(
    { chatId: chat._id, senderRole: incomingRole, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return NextResponse.json({
    chat: {
      _id: chat._id.toString(),
      customerName: (chat.customerName as string) ?? "Customer",
    },
    messages: messages.map(mapMessage),
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "user" && user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!ObjectId.isValid(storeId)) return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });

  const { text, chatId, replyTo } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Message text required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = user.role === "owner"
    ? await getOwnedStore(db, user.id, storeId)
    : await db.collection("stores").findOne({ _id: new ObjectId(storeId), status: "active" });
  if (!store) return NextResponse.json({ error: user.role === "owner" ? "Forbidden" : "Store not found" }, { status: user.role === "owner" ? 403 : 404 });

  const senderDoc = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
  const now = new Date();
  let chat: WithId<Document> | null = null;

  if (user.role === "owner") {
    if (!chatId || !ObjectId.isValid(chatId)) return NextResponse.json({ error: "chatId required" }, { status: 400 });
    chat = await db.collection("customer_chats").findOne({
      _id: new ObjectId(chatId as string),
      storeId: new ObjectId(storeId),
    });
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  } else {
    chat = await getCustomerChat(db, storeId, user.id);
    if (!chat) {
      const customerName = (senderDoc?.name as string) ?? "Customer";
      const result = await db.collection("customer_chats").insertOne({
        storeId: new ObjectId(storeId),
        customerId: new ObjectId(user.id),
        customerName,
        storeName: (store.name as string) ?? "Store",
        createdAt: now,
        updatedAt: now,
      });
      chat = {
        _id: result.insertedId,
        storeId: new ObjectId(storeId),
        customerId: new ObjectId(user.id),
        customerName,
      } as WithId<Document>;
    }
  }

  const senderRole = user.role === "owner" ? "owner" : "customer";
  const senderName = senderRole === "owner"
    ? ((store.name as string) ?? (senderDoc?.name as string) ?? "Store Owner")
    : ((senderDoc?.name as string) ?? "Customer");
  const senderAvatarUrl = senderRole === "owner"
    ? ((store.logoUrl as string) ?? (senderDoc?.avatarUrl as string) ?? "")
    : ((senderDoc?.avatarUrl as string) ?? "");
  const content = text.trim() as string;

  const messageDoc: Record<string, unknown> = {
    chatId: chat._id,
    storeId: new ObjectId(storeId),
    customerId: chat.customerId as ObjectId,
    senderId: new ObjectId(user.id),
    senderRole,
    senderName,
    senderAvatarUrl,
    content,
    isRead: false,
    createdAt: now,
  };
  if (replyTo && typeof replyTo === "object" && replyTo._id) {
    messageDoc.replyTo = {
      _id: replyTo._id as string,
      senderName: (replyTo.senderName as string) ?? "",
      text: (replyTo.text as string) ?? "",
      deleted: (replyTo.deleted as boolean) ?? false,
    };
  }

  const result = await db.collection("customer_messages").insertOne(messageDoc);
  await db.collection("customer_chats").updateOne(
    { _id: chat._id },
    { $set: { lastMessage: content, lastSender: senderRole, updatedAt: now } }
  );

  return NextResponse.json({
    chat: {
      _id: chat._id.toString(),
      customerName: (chat.customerName as string) ?? "Customer",
    },
    message: mapMessage({ _id: result.insertedId, ...messageDoc } as WithId<Document>),
  });
}

// Owner deletes a whole customer conversation (thread + all its messages).
export async function DELETE(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!ObjectId.isValid(storeId)) return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });

  const chatId = req.nextUrl.searchParams.get("chatId");
  if (!chatId || !ObjectId.isValid(chatId)) {
    return NextResponse.json({ error: "chatId required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await getOwnedStore(db, user.id, storeId);
  if (!store) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const chat = await db.collection("customer_chats").findOne({
    _id: new ObjectId(chatId),
    storeId: new ObjectId(storeId),
  });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.collection("customer_messages").deleteMany({ chatId: chat._id });
  await db.collection("customer_chats").deleteOne({ _id: chat._id });

  return NextResponse.json({ ok: true });
}
