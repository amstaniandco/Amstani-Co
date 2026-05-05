import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";

export async function GET() {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const applications = await db
      .collection("store_applications")
      .find({ status: { $in: ["forwarded_to_admin", "approved_by_admin", "denied_by_admin"] } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/stores/applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
