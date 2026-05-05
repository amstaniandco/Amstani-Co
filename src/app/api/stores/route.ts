import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");

    if (storeId) {
      if (!ObjectId.isValid(storeId)) {
        return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });
      }

      const store = await db
        .collection("stores")
        .findOne(
          { _id: new ObjectId(storeId), status: "active" },
          { projection: { _id: 1, name: 1, logoUrl: 1, bannerUrl: 1, description: 1, live: 1, rating: 1, settings: 1 } }
        );

      return NextResponse.json({ stores: store ? [store] : [] }, { status: 200 });
    }

    const stores = await db
      .collection("stores")
      .find({ status: "active" })
      .project({ _id: 1, name: 1, logoUrl: 1, bannerUrl: 1, description: 1, live: 1, rating: 1, settings: 1 })
      .limit(40)
      .toArray();

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
