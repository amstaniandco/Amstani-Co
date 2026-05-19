import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

type Ctx = { params: Promise<{ storeId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { storeId } = await params;
  if (!ObjectId.isValid(storeId)) {
    return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ _id: new ObjectId(storeId) }, { projection: { _id: 1 } });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";

  await db.collection("store_visits").insertOne({
    storeId,
    ip,
    userAgent: req.headers.get("user-agent") ?? "",
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
