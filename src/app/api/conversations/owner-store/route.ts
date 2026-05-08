import { NextResponse } from "next/server";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  const user = await getUserFromToken();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  return NextResponse.json({
    storeId: store._id.toString(),
    storeName: (store.name as string) ?? "My Store",
  });
}
