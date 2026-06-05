import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const stores = await db
      .collection("stores")
      .aggregate([
        { $match: { warnings: { $gte: 3 } } },
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            warnings: 1,
            warningsResetAt: 1,
            "owner.name": 1,
            "owner.email": 1,
            "owner.phone": 1,
          },
        },
      ])
      .toArray();

    const result = stores.map((s) => ({
      storeId: String(s._id),
      storeName: s.name,
      warnings: s.warnings,
      warningsResetAt: s.warningsResetAt || null,
      ownerName: s.owner?.name || "Unknown",
      ownerEmail: s.owner?.email || "",
      ownerPhone: s.owner?.phone || "",
    }));

    return NextResponse.json({ warnings: result });
  } catch (error) {
    console.error("GET /api/admin/live-warnings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/live-warnings — reset warnings for a specific store
export async function DELETE(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { storeId } = await req.json();
    if (!storeId) return NextResponse.json({ error: "storeId required" }, { status: 400 });

    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection("stores").updateOne(
      { _id: new ObjectId(storeId) },
      { $set: { warnings: 0, warningsResetAt: new Date(), updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/live-warnings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
