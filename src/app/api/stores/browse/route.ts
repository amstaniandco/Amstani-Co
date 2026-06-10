import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/db";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const stateFilter = params.get("state")?.trim() ?? "";
    const promotedOnly = params.get("promoted_only") === "true";
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    const today = new Date().toISOString().slice(0, 10);

    const pipeline: object[] = [
      { $match: { status: "active" } },
      // Only include stores with a fully completed profile
      {
        $addFields: {
          profileComplete: {
            $and: [
              { $gt: [{ $strLenCP: { $ifNull: ["$name", ""] } }, 0] },
              { $gt: [{ $strLenCP: { $ifNull: ["$description", ""] } }, 0] },
              { $gt: [{ $strLenCP: { $ifNull: ["$logoUrl", ""] } }, 0] },
              { $gt: [{ $strLenCP: { $ifNull: ["$bannerUrl", ""] } }, 0] },
              { $gt: [{ $size: { $ifNull: ["$settings.languages", []] } }, 0] },
            ],
          },
        },
      },
      { $match: { profileComplete: true } },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    ];

    if (stateFilter) {
      pipeline.push({ $match: { "owner.state": stateFilter } });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          logoUrl: 1,
          bannerUrl: 1,
          live: 1,
          liveLink: 1,
          rating: 1,
          isLive: 1,
          "owner.state": 1,
        },
      },
      // Join active promotions — storeId in promotions is stored as string
      {
        $lookup: {
          from: "promotions",
          let: { sid: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$storeId", "$$sid"] },
                endDate: { $gte: today },
              },
            },
            { $limit: 1 },
          ],
          as: "activePromotion",
        },
      },
      {
        $addFields: {
          isPromoted: { $gt: [{ $size: "$activePromotion" }, 0] },
        },
      },
      // Landing page passes promoted_only=true to show only promoted stores
      ...(promotedOnly ? [{ $match: { isPromoted: true } }] : []),
      { $limit: 60 },
      { $project: { activePromotion: 0 } },
    );

    const stores = await db.collection("stores").aggregate(pipeline).toArray();

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error("GET /api/stores/browse error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
