import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { getStoreRank } from "../../../../../lib/store-rank";

export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    if (!ObjectId.isValid(storeId)) return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });

    const tokenUser = await getUserFromToken();
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const [followerCount, productCount, rank] = await Promise.all([
      db.collection("storeFollowers").countDocuments({ storeId: new ObjectId(storeId) }),
      db.collection("products").countDocuments({ storeId: new ObjectId(storeId) }),
      getStoreRank(db, storeId),
    ]);

    let isFollowing = false;
    if (tokenUser) {
      const existing = await db.collection("storeFollowers").findOne({
        storeId: new ObjectId(storeId),
        userId: new ObjectId(tokenUser.id),
      });
      isFollowing = !!existing;
    }

    return NextResponse.json({ followerCount, productCount, isFollowing, rank });
  } catch (error) {
    console.error("GET /api/stores/[storeId]/stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
