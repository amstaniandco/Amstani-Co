import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { evaluateWeeklyLiveCompliance, REQUIRED_LIVE_MINUTES_PER_DAY } from "../../../../../lib/live-compliance";

export async function POST() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await db.collection("stores").findOne({ ownerId: new ObjectId(tokenUser.id) });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    if (!store.isLive) return NextResponse.json({ message: "Store is already offline" }, { status: 200 });

    const now = new Date();
    const startedAt = store.liveSessionStartedAt ? new Date(store.liveSessionStartedAt) : now;
    const durationMinutes = Math.floor((now.getTime() - startedAt.getTime()) / 60000);
    const isShortSession = durationMinutes < REQUIRED_LIVE_MINUTES_PER_DAY;

    const dateStr = startedAt.toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

    await db.collection("liveSessions").insertOne({
      storeId: store._id,
      date: dateStr,
      startedAt,
      endedAt: now,
      durationMinutes,
      warning: isShortSession,
      createdAt: now,
    });

    await db.collection("stores").updateOne(
      { _id: store._id },
      {
        $set: {
          isLive: false,
          liveLink: null,
          liveSessionStartedAt: null,
          updatedAt: now,
        },
      }
    );

    const compliance = await evaluateWeeklyLiveCompliance(db, store, now);

    return NextResponse.json({
      message: "Store is now offline",
      durationMinutes,
      warning: isShortSession,
      warnings: compliance.warnings,
    }, { status: 200 });
  } catch (error) {
    console.error("POST /api/owner/store/go-offline error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
