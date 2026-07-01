import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const promotions = await db
      .collection("promotions")
      .find(
        { endDate: { $gte: today }, imageUrl: { $exists: true, $nin: [null, ""] } },
        { projection: { storeId: 1, storeName: 1, imageUrl: 1, mediaType: 1, endDate: 1 } }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ promotions });
  } catch {
    return NextResponse.json({ promotions: [] });
  }
}
