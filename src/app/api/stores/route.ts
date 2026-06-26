import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const stateFilter = searchParams.get("state")?.trim() ?? "";

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    if (storeId) {
      if (!ObjectId.isValid(storeId)) {
        return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });
      }

      // Single round-trip: fetch the store and its owner's phone together
      const results = await db
        .collection("stores")
        .aggregate([
          { $match: { _id: new ObjectId(storeId), status: "active" } },
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
              _id: 1, name: 1, logoUrl: 1, bannerUrl: 1, description: 1,
              isLive: 1, liveLink: 1, rating: 1, settings: 1,
              ownerPhone: { $ifNull: ["$owner.phone", ""] },
            },
          },
        ])
        .toArray();

      const store = results[0];
      if (!store) return NextResponse.json({ stores: [] }, { status: 200 });

      // Only expose stores with a complete profile
      const profileComplete = !!(
        store.name?.trim() &&
        store.description?.trim() &&
        store.logoUrl?.trim() &&
        store.bannerUrl?.trim() &&
        (store.settings?.languages as string[] | undefined)?.length
      );

      if (!profileComplete) return NextResponse.json({ stores: [] }, { status: 200 });

      return NextResponse.json({ stores: [store] }, { status: 200 });
    }

    const pipeline: object[] = [
      { $match: { status: "active" } },
      // Only include stores with a complete profile
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
      {
        $project: {
          _id: 1,
          name: 1,
          logoUrl: 1,
          bannerUrl: 1,
          description: 1,
          isLive: 1,
          liveLink: 1,
          rating: 1,
          settings: 1,
          "owner.state": 1,
          ownerPhone: { $ifNull: ["$owner.phone", ""] },
        },
      },
      { $limit: 40 },
    );

    const stores = await db.collection("stores").aggregate(pipeline).toArray();

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
