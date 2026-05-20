import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const banners = await db
      .collection("communications")
      .find({
        communicationType: "banner",
        status: "Live",
        audience: { $in: ["customers", "all"] },
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .project({ _id: 1, title: 1, imageUrl: 1 })
      .toArray();

    return NextResponse.json({
      banners: banners.map((b) => ({
        _id: String(b._id),
        title: b.title,
        imageUrl: b.imageUrl,
      })),
    });
  } catch (error) {
    console.error("GET /api/communications/banners error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
