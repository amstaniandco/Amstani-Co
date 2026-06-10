import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromToken();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const filter: Record<string, unknown> = { sender: "owner" };
  if (since) filter.createdAt = { $gte: new Date(since) };

  const docs = await db
    .collection("store_messages")
    .aggregate([
      { $match: filter },
      { $group: { _id: "$storeId", count: { $sum: 1 } } },
    ])
    .toArray();

  const counts: Record<string, number> = {};
  for (const d of docs) {
    if (d._id) counts[d._id as string] = d.count as number;
  }

  return NextResponse.json({ counts });
}
