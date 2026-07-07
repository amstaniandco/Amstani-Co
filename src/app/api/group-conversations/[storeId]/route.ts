import { NextRequest, NextResponse } from "next/server";
import { ObjectId, WithId, Document } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

type Params = { params: Promise<{ storeId: string }> };

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

export async function GET(_req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "user" && user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!ObjectId.isValid(storeId)) return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const storeObjectId = new ObjectId(storeId);

  const store = await db.collection("stores").findOne({ _id: storeObjectId });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  if (user.role === "owner" && (store.ownerId as ObjectId)?.toString() !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await db
    .collection("store_group_messages")
    .find({ storeId: storeObjectId })
    .sort({ createdAt: 1 })
    .limit(200)
    .toArray();

  const blockedUserIds = ((store.blockedUserIds as ObjectId[]) ?? []).map((id) => id.toString());

  return NextResponse.json({
    storeName: (store.name as string) ?? "Store",
    messages: messages.map(mapMessage),
    blockedUserIds,
    // Whether the requesting customer has been blocked from this group chat
    blocked: user.role === "user" && blockedUserIds.includes(user.id),
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

  const { text, replyTo } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Message text required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const storeObjectId = new ObjectId(storeId);

  const store = await db.collection("stores").findOne({ _id: storeObjectId });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  if (user.role === "owner" && (store.ownerId as ObjectId)?.toString() !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Blocked customers cannot post to the group chat.
  if (user.role === "user") {
    const blockedUserIds = ((store.blockedUserIds as ObjectId[]) ?? []).map((id) => id.toString());
    if (blockedUserIds.includes(user.id)) {
      return NextResponse.json({ error: "blocked" }, { status: 403 });
    }
  }

  const senderDoc = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
  const senderRole = user.role === "owner" ? "owner" : "customer";
  const senderName = senderRole === "owner"
    ? ((store.name as string) ?? (senderDoc?.name as string) ?? "Store Owner")
    : ((senderDoc?.name as string) ?? "Customer");

  const now = new Date();
  const content = text.trim() as string;

  const messageDoc: Record<string, unknown> = {
    storeId: storeObjectId,
    senderId: new ObjectId(user.id),
    senderRole,
    senderName,
    content,
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

  const result = await db.collection("store_group_messages").insertOne(messageDoc);

  return NextResponse.json({
    message: mapMessage({ _id: result.insertedId, ...messageDoc } as WithId<Document>),
  });
}
