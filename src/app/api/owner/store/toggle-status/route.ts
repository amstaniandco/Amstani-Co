import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

export async function PATCH() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await db.collection("stores").findOne({ ownerId: new ObjectId(tokenUser.id) });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    if (store.status !== "active" && store.status !== "inactive") {
      return NextResponse.json(
        { error: "Only active or inactive stores can be toggled" },
        { status: 400 }
      );
    }

    const newStatus = store.status === "active" ? "inactive" : "active";

    await db.collection("stores").updateOne(
      { _id: store._id },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );

    return NextResponse.json({ status: newStatus }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/owner/store/toggle-status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
