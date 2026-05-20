import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { liveLink } = await req.json();
    if (!liveLink?.trim()) {
      return NextResponse.json({ error: "Live link is required" }, { status: 400 });
    }

    let normalizedLink = liveLink.trim();
    if (!normalizedLink.startsWith("http://") && !normalizedLink.startsWith("https://")) {
      normalizedLink = "https://" + normalizedLink;
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await db.collection("stores").findOne({ ownerId: new ObjectId(tokenUser.id) });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    if (store.status !== "active") {
      return NextResponse.json({ error: "Store must be active to go live" }, { status: 400 });
    }

    await db.collection("stores").updateOne(
      { _id: store._id },
      {
        $set: {
          isLive: true,
          liveLink: normalizedLink,
          liveSessionStartedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: "Store is now live" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/owner/store/go-live error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
