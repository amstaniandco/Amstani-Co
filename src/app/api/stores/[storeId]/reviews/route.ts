import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

type Ctx = { params: Promise<{ storeId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { storeId } = await params;
  const client = await clientPromise;
  const reviews = await client
    .db(DB_NAME)
    .collection("store_reviews")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { if (breakdown[r.rating] !== undefined) breakdown[r.rating]++; });

  return NextResponse.json({ reviews, avg: Math.round(avg * 10) / 10, total, breakdown });
}

export async function POST(req: Request, { params }: Ctx) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 });

  const { storeId } = await params;
  const { rating, text } = await req.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // One review per user per store
  const existing = await db.collection("store_reviews").findOne({ storeId, userId: user.id });
  const now = new Date();

  const userDoc = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user.id) }, { projection: { name: 1 } });
  const userName = userDoc?.name || "Anonymous";

  if (existing) {
    await db.collection("store_reviews").updateOne(
      { _id: existing._id },
      { $set: { rating, text: text ?? "", updatedAt: now } }
    );
  } else {
    await db.collection("store_reviews").insertOne({
      storeId, userId: user.id, userName, rating, text: text ?? "", createdAt: now, updatedAt: now,
    });
  }

  return NextResponse.json({ ok: true });
}
