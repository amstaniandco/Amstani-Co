import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    const stores = await db
      .collection("stores")
      .aggregate([
        { $match: { status: "active" } },
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            logoUrl: 1,
            bannerUrl: 1,
            live: 1,
            rating: 1,
            "owner.state": 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 60 },
      ])
      .toArray();

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error("GET /api/stores/browse error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
