import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ reviews: [], avg: 0, total: 0, breakdown: { 5:0,4:0,3:0,2:0,1:0 } });

  const storeId = store._id.toString();
  const raw = await db.collection("store_reviews")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .toArray();

  const total = raw.length;
  const avg   = total ? raw.reduce((s, r) => s + r.rating, 0) / total : 0;
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  raw.forEach(r => { if (breakdown[r.rating] !== undefined) breakdown[r.rating]++; });

  return NextResponse.json({
    reviews: raw.map(r => ({
      id:        r._id.toString(),
      userId:    r.userId,
      userName:  r.userName || "Anonymous",
      rating:    r.rating,
      text:      r.text || "",
      createdAt: r.createdAt,
    })),
    avg:       Math.round(avg * 10) / 10,
    total,
    breakdown,
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reviewId = req.nextUrl.searchParams.get("id");
  if (!reviewId) return NextResponse.json({ error: "Review ID required" }, { status: 400 });

  let oid: ObjectId;
  try { oid = new ObjectId(reviewId); }
  catch { return NextResponse.json({ error: "Invalid ID" }, { status: 400 }); }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const storeId = store._id.toString();
  const review  = await db.collection("store_reviews").findOne({ _id: oid, storeId });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  await db.collection("store_reviews").deleteOne({ _id: oid });
  return NextResponse.json({ ok: true });
}
