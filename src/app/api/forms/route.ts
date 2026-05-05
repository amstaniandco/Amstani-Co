import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, name, email, phone, message } = body;
    if (!storeId) return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    if (!name || !email) return NextResponse.json({ error: "name and email are required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const store = await db.collection("stores").findOne({ _id: new ObjectId(storeId) });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

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
