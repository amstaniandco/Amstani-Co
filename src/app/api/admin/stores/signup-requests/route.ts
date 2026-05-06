import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const requests = await db
      .collection("store_signup_requests")
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "store_applications",
            localField: "applicationId",
            foreignField: "_id",
            as: "application",
          },
        },
        { $unwind: { path: "$application", preserveNullAndEmptyArrays: true } },
        { $limit: 200 },
      ])
      .toArray();

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/stores/signup-requests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
