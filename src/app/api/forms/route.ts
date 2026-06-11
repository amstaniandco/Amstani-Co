import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, name, email, phone, message, state } = body;
    if (!storeId) return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    if (!name || !email) return NextResponse.json({ error: "name and email are required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await db.collection("stores").findOne({ _id: new ObjectId(storeId) });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    // ── Enforce application limits (set in Admin → Store Applications) ─────────
    const settings = await db
      .collection("admin_settings")
      .findOne({ _id: "store_applications" as unknown as ObjectId });

    const acceptingApplications = settings?.acceptingApplications ?? true;
    if (!acceptingApplications) {
      return NextResponse.json(
        { error: "Store applications are currently closed. Please check back later." },
        { status: 403 }
      );
    }

    // Resolve the applicant's state (sent explicitly, or parsed from the message)
    const stateName =
      (typeof state === "string" && state.trim()) ||
      (typeof message === "string" ? message.match(/State:\s*([^|]+)/i)?.[1]?.trim() : "") ||
      "";

    if (stateName) {
      const monthlyLimit = Number(settings?.monthlyLimit ?? 10);
      const stateSettings = (settings?.stateSettings ?? {}) as Record<string, { max?: number }>;
      const maxForState = stateSettings[stateName]?.max ?? monthlyLimit;

      // Occupied = number of existing stores whose owner is in this state
      const occupiedAgg = await db.collection("stores").aggregate([
        { $lookup: { from: "users", localField: "ownerId", foreignField: "_id", as: "owner" } },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $match: { "owner.state": stateName } },
        { $count: "n" },
      ]).toArray();
      const occupied = occupiedAgg[0]?.n ?? 0;

      if (occupied >= maxForState) {
        return NextResponse.json(
          { error: `Applications for ${stateName} are full (limit ${maxForState} reached). No store slots are currently available in this state.` },
          { status: 403 }
        );
      }
    }

    const application = {
      storeId: new ObjectId(storeId),
      ownerId: store.ownerId ?? null,
      storeName: (store as any).name ?? "",
      applicant: { name, email, phone, message },
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("store_applications").insertOne(application as any);

    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/forms error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
