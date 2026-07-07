import { NextRequest, NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { ObjectId, WithId, Document } from "mongodb";

type Params = { params: Promise<{ storeId: string; messageId: string }> };

function mapMsg(m: WithId<Document>) {
  return {
    _id: (m._id as ObjectId).toString(),
    sender: m.sender as string,
    senderName: m.senderName as string,
    text: m.text as string,
    createdAt: m.createdAt as Date,
    deleted: (m.deleted as boolean) ?? false,
    edited: (m.edited as boolean) ?? false,
    reactions: (m.reactions as Record<string, string[]> | undefined) ?? {},
    replyTo: (m.replyTo as { _id: string; senderName: string; text: string; deleted?: boolean } | undefined) ?? undefined,
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { storeId, messageId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let msgObjectId: ObjectId;
  try {
    msgObjectId = new ObjectId(messageId);
  } catch {
    return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (user.role === "owner") {
    const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
    if (!store || store._id.toString() !== storeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const msgDoc = await db.collection("store_messages").findOne({ _id: msgObjectId, storeId });
  if (!msgDoc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { action, text, emoji } = await req.json();

  // Either party can react; only the author can edit/delete.
  if (action === "react") {
    if (!emoji || typeof emoji !== "string") {
      return NextResponse.json({ error: "Emoji required" }, { status: 400 });
    }
    const reactions = { ...((msgDoc.reactions as Record<string, string[]>) ?? {}) };
    const list = reactions[emoji] ?? [];
    if (list.includes(user.id)) {
      const next = list.filter((id) => id !== user.id);
      if (next.length) reactions[emoji] = next;
      else delete reactions[emoji];
    } else {
      reactions[emoji] = [...list, user.id];
    }
    await db.collection("store_messages").updateOne(
      { _id: msgObjectId },
      { $set: { reactions, updatedAt: new Date() } }
    );
    const updated = await db.collection("store_messages").findOne({ _id: msgObjectId });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: mapMsg(updated) });
  }

  if (msgDoc.sender !== user.role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (action === "delete") {
    await db.collection("store_messages").updateOne(
      { _id: msgObjectId },
      { $set: { deleted: true, text: "", updatedAt: new Date() } }
    );
  } else if (action === "edit") {
    if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });
    await db.collection("store_messages").updateOne(
      { _id: msgObjectId },
      { $set: { text: text.trim() as string, edited: true, updatedAt: new Date() } }
    );
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await db.collection("store_messages").findOne({ _id: msgObjectId });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ message: mapMsg(updated) });
}
