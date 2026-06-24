import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { evaluateWeeklyLiveCompliance, REQUIRED_LIVE_MINUTES_PER_DAY } from "../../../../lib/live-compliance";

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await db.collection("stores").findOne({ ownerId: new ObjectId(tokenUser.id) });
    if (!store) {
      return NextResponse.json({
        dailyTimings: { from: "09:00", to: "15:00" },
        warnings: 0,
        warningsResetAt: null,
        isLive: false,
        liveLink: null,
        liveSessionStartedAt: null,
        storeId: null,
        storeName: "My Store",
        storeStatus: "pending",
      });
    }

    const compliance = await evaluateWeeklyLiveCompliance(db, store);

    const followerCount = await db.collection("storeFollowers").countDocuments({ storeId: store._id });

    return NextResponse.json({
      dailyTimings: store.dailyTimings || { from: "09:00", to: "15:00" },
      warnings: compliance.warnings,
      warningsResetAt: compliance.warningsResetAt || null,
      isLive: store.isLive || false,
      liveLink: store.liveLink || null,
      liveSessionStartedAt: store.liveSessionStartedAt || null,
      storeId: String(store._id),
      storeName: store.name || "My Store",
      storeStatus: store.status,
      followerCount,
    });
  } catch (error) {
    console.error("GET /api/owner/timings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { from, to } = await req.json();
    if (!from || !to) {
      return NextResponse.json({ error: "Both from and to times are required" }, { status: 400 });
    }

    const [fromHour, fromMin] = from.split(":").map(Number);
    const [toHour, toMin] = to.split(":").map(Number);
    let duration = (toHour * 60 + toMin) - (fromHour * 60 + fromMin);
    if (duration < 0) duration += 24 * 60; // overnight

    if (duration < REQUIRED_LIVE_MINUTES_PER_DAY) {
      return NextResponse.json({ error: "Schedule must be at least 6 hours" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection("stores").updateOne(
      { ownerId: new ObjectId(tokenUser.id) },
      { $set: { dailyTimings: { from, to }, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Timings saved" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/owner/timings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
