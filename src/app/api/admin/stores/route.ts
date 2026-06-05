import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    const stores = await db
      .collection("stores")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        // storeId in store_reviews is a string — compare against $toString of _id
        {
          $lookup: {
            from: "store_reviews",
            let: { sidStr: { $toString: "$_id" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$storeId", "$$sidStr"] } } },
              { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
            ],
            as: "reviewData",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            status: 1,
            logoUrl: 1,
            bannerUrl: 1,
            description: 1,
            createdAt: 1,
            updatedAt: 1,
            "owner.name": 1,
            "owner.email": 1,
            "owner.phone": 1,
            "owner.state": 1,
            rating: { $ifNull: [{ $arrayElemAt: ["$reviewData.avg", 0] }, 0] },
            reviewCount: { $ifNull: [{ $arrayElemAt: ["$reviewData.count", 0] }, 0] },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/stores error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { storeId, status } = await req.json();
    if (!storeId || !status) {
      return NextResponse.json({ error: "storeId and status are required" }, { status: 400 });
    }
    if (!["pending", "active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    await db
      .collection("stores")
      .updateOne({ _id: new ObjectId(storeId) }, { $set: { status, updatedAt: new Date() } });

    return NextResponse.json({ message: "Store status updated" }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/stores error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
