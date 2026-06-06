import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const today = new Date().toISOString().slice(0, 10);

    const promotion = await db.collection("promotions").findOne(
      { storeId, endDate: { $gte: today } },
      { projection: { storeId: 1, endDate: 1, imageUrl: 1 } }
    );

    return NextResponse.json({
      isPromoted: !!promotion,
      endDate: promotion?.endDate ?? null,
    });
  } catch {
    return NextResponse.json({ isPromoted: false, endDate: null });
  }
}
