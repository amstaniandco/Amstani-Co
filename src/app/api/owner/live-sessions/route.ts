import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} Hour${h !== 1 ? "s" : ""}`;
  return `${h} Hour${h !== 1 ? "s" : ""} ${m} min`;
}

export async function GET(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await db.collection("stores").findOne(
      { ownerId: new ObjectId(tokenUser.id) },
      { projection: { _id: 1 } }
    );
    if (!store) return NextResponse.json({ sessions: [] });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await db
      .collection("liveSessions")
      .find({ storeId: store._id, createdAt: { $gte: startDate, $lte: endDate } })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = sessions.map((s) => ({
      _id: String(s._id),
      date: s.date,
      from: new Date(s.startedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      to: new Date(s.endedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      durationMinutes: s.durationMinutes,
      warning: s.warning,
      completed: formatDuration(s.durationMinutes),
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error) {
    console.error("GET /api/owner/live-sessions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
