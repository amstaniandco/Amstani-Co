import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const applications = await db
      .collection("store_applications")
      .find({ ownerId: new ObjectId(tokenUser.id) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("GET /api/owner/applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
