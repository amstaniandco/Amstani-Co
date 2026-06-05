import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../../lib/db";
import { getUserFromToken } from "../../../../../../lib/auth";

const SETTINGS_DOC_ID = "store_applications";

// GET /api/admin/stores/applications/settings
// Returns: { monthlyLimit, acceptingApplications, stateSettings, stateOccupied }
// stateOccupied = { [stateName]: count } of active/pending stores per state
export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const [settingsDoc, storesByState] = await Promise.all([
      db.collection("admin_settings").findOne({ _id: SETTINGS_DOC_ID as unknown as import("mongodb").ObjectId }),

      // Count stores per owner state
      db.collection("stores").aggregate([
        { $lookup: { from: "users", localField: "ownerId", foreignField: "_id", as: "owner" } },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $match: { "owner.state": { $exists: true, $ne: "" } } },
        { $group: { _id: "$owner.state", count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    const stateOccupied: Record<string, number> = {};
    for (const s of storesByState) {
      if (s._id) stateOccupied[s._id] = s.count;
    }

    return NextResponse.json({
      monthlyLimit: settingsDoc?.monthlyLimit ?? 10,
      acceptingApplications: settingsDoc?.acceptingApplications ?? true,
      stateSettings: settingsDoc?.stateSettings ?? {},
      stateOccupied,
    });
  } catch (error) {
    console.error("GET /api/admin/stores/applications/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/stores/applications/settings
// Body: { monthlyLimit?, acceptingApplications?, stateSettings? }
export async function PUT(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (body.monthlyLimit !== undefined) update.monthlyLimit = Number(body.monthlyLimit);
    if (body.acceptingApplications !== undefined) update.acceptingApplications = Boolean(body.acceptingApplications);
    if (body.stateSettings !== undefined) update.stateSettings = body.stateSettings;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection("admin_settings").updateOne(
      { _id: SETTINGS_DOC_ID as unknown as import("mongodb").ObjectId },
      { $set: update },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/admin/stores/applications/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
