import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

const CONFIG_ID = "pricing_config";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const [store, config] = await Promise.all([
    db.collection("stores").findOne({ ownerId: new ObjectId(user.id) }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.collection("pricing_config").findOne({ _id: CONFIG_ID as any }),
  ]);

  if (!store) return NextResponse.json({ products: [], storeName: "", markupPercent: 20, discountCap: 20 });

  const markupPercent: number = config?.markupPercent ?? 20;
  const discountCap: number = config?.discountCap ?? 20;

  const products = await db
    .collection("store_products")
    .find({ storeId: store._id.toString() })
    .sort({ listedAt: -1 })
    .toArray();

  return NextResponse.json({ products, storeName: store.name, markupPercent, discountCap });
}
