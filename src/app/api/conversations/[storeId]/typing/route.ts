import { NextRequest, NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

type Params = { params: Promise<{ storeId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { isTyping } = await req.json();

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (isTyping) {
    await db.collection("typing_events").updateOne(
      { storeId, typingBy: user.role },
      { $set: { storeId, typingBy: user.role, updatedAt: new Date() } },
      { upsert: true }
    );
  } else {
    await db.collection("typing_events").deleteOne({ storeId, typingBy: user.role });
  }

  return NextResponse.json({ ok: true });
}
