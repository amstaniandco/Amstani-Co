import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    if (!ObjectId.isValid(storeId)) return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });

    const tokenUser = await getUserFromToken();
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const followerCount = await db.collection("storeFollowers").countDocuments({ storeId: new ObjectId(storeId) });

    let isFollowing = false;
    if (tokenUser) {
      const existing = await db.collection("storeFollowers").findOne({
        storeId: new ObjectId(storeId),
        userId: new ObjectId(tokenUser.id),
      });
      isFollowing = !!existing;
    }

    return NextResponse.json({ followerCount, isFollowing });
  } catch (error) {
    console.error("GET /api/stores/[storeId]/follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { storeId } = await params;
    if (!ObjectId.isValid(storeId)) return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const existing = await db.collection("storeFollowers").findOne({
      storeId: new ObjectId(storeId),
      userId: new ObjectId(tokenUser.id),
    });

    if (existing) {
      await db.collection("storeFollowers").deleteOne({ _id: existing._id });
    } else {
      await db.collection("storeFollowers").insertOne({
        storeId: new ObjectId(storeId),
        userId: new ObjectId(tokenUser.id),
        followedAt: new Date(),
      });
    }

    const followerCount = await db.collection("storeFollowers").countDocuments({ storeId: new ObjectId(storeId) });
    return NextResponse.json({ following: !existing, followerCount });
  } catch (error) {
    console.error("POST /api/stores/[storeId]/follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
