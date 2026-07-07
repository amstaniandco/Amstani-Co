import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

// Mark the owner's admin or group chat thread as read (customer threads are
// marked read automatically when their messages are fetched).
export async function POST(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { thread } = await req.json();
  if (thread !== "admin" && thread !== "group") {
    return NextResponse.json({ error: "Invalid thread" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne(
    { ownerId: new ObjectId(user.id) },
    { projection: { _id: 1 } }
  );
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const threadKey = `${thread}:${store._id.toString()}`;
  await db.collection("chat_reads").updateOne(
    { userId: new ObjectId(user.id), threadKey },
    { $set: { lastReadAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
