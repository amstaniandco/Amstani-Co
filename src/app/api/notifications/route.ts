import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const notifications = await db
    .collection("notifications")
    .find({ userId: new ObjectId(user.id) })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return NextResponse.json({
    notifications: notifications.map((item) => ({
      _id: item._id.toString(),
      title: item.title,
      message: item.message,
      type: item.type,
      isRead: item.isRead,
      createdAt: item.createdAt,
    })),
  });
}
