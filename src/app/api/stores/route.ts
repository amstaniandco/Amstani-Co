import { NextResponse } from "next/server";
import clientPromise from "../../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    const stores = await db
      .collection("stores")
      .find({ status: "active" })
      .project({ _id: 1, name: 1, logoUrl: 1, bannerUrl: 1, description: 1, live: 1, rating: 1 })
      .limit(40)
      .toArray();

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
