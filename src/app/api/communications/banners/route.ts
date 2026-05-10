import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";

export async function GET() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const banners = await db
    .collection("communications")
    .find({ communicationType: "banner", status: "Live", imageUrl: { $type: "string", $ne: "" } })
    .project({ _id: 1, title: 1, subtitle: 1, imageUrl: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(3)
    .toArray();

  return NextResponse.json({
    banners: banners.map((banner) => ({
      _id: banner._id.toString(),
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      createdAt: banner.createdAt,
    })),
  });
}
