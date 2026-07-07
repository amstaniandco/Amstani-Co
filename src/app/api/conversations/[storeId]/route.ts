import { NextRequest, NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { ObjectId, WithId, Document } from "mongodb";

type Params = { params: Promise<{ storeId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (user.role === "owner") {
    const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
    if (!store || store._id.toString() !== storeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const messages = await db
    .collection("store_messages")
    .find({ storeId })
    .sort({ createdAt: 1 })
    .limit(100)
    .toArray();

  return NextResponse.json({
    messages: messages.map((m: WithId<Document>) => ({
      _id: (m._id as ObjectId).toString(),
      sender: m.sender as string,
      senderName: m.senderName as string,
      text: m.text as string,
      createdAt: m.createdAt as Date,
      deleted: (m.deleted as boolean) ?? false,
      edited: (m.edited as boolean) ?? false,
      reactions: (m.reactions as Record<string, string[]> | undefined) ?? {},
      replyTo: (m.replyTo as { _id: string; senderName: string; text: string; deleted?: boolean } | undefined) ?? undefined,
    })),
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (user.role === "owner") {
    const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
    if (!store || store._id.toString() !== storeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { text, replyTo } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Message text required" }, { status: 400 });

  let senderName = user.role === "admin" ? "Super Admin" : "Store Owner";
  if (user.role === "owner") {
    const ownerDoc = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
    if (ownerDoc?.name) senderName = ownerDoc.name as string;
  }

  const doc: Record<string, unknown> = {
    storeId,
    sender: user.role as "admin" | "owner",
    senderName,
    text: text.trim() as string,
    createdAt: new Date(),
  };
  if (replyTo && typeof replyTo === "object" && replyTo._id) {
    doc.replyTo = {
      _id: replyTo._id as string,
      senderName: (replyTo.senderName as string) ?? "",
      text: (replyTo.text as string) ?? "",
      deleted: (replyTo.deleted as boolean) ?? false,
    };
  }

  const result = await db.collection("store_messages").insertOne(doc);

  return NextResponse.json({
    message: {
      _id: result.insertedId.toString(),
      ...doc,
      deleted: false,
      edited: false,
    },
  });
}
