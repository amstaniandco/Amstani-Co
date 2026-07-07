import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { computeChatUnreads } from "../../../../lib/chatUnreads";

// Per-thread unread counts for the owner's chats inbox (admin, group, each customer).
export async function GET() {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const unreads = await computeChatUnreads(db, user.id);
  return NextResponse.json(unreads);
}
