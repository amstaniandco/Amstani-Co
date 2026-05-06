import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

async function requireOwner() {
  const user = await getUserFromToken();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role !== "owner" && user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

// GET — owner fetches their own listing request history
export async function GET() {
  const auth = await requireOwner();
  if (auth.error) return auth.error;

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // Find the store owned by this user
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(auth.user!.id) });
  if (!store) return NextResponse.json({ requests: [] });

  const requests = await db
    .collection("listing_requests")
    .find({ storeId: store._id.toString() })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ requests });
}

// POST — owner submits a new listing request
export async function POST(req: Request) {
  const auth = await requireOwner();
  if (auth.error) return auth.error;

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(auth.user!.id) });
  if (!store) {
    return NextResponse.json({ error: "No store found for this owner" }, { status: 404 });
  }

  const body = await req.json();
  const { orderId, orderDate, items } = body;

  if (!orderId || !orderDate || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "orderId, orderDate, and items are required" }, { status: 400 });
  }

  const validItems = items.filter(
    (i: { productId: string; quantity: string | number }) => i.productId && Number(i.quantity) > 0
  );
  if (validItems.length === 0) {
    return NextResponse.json({ error: "At least one valid item with productId and quantity is required" }, { status: 400 });
  }

  const now = new Date();
  const result = await db.collection("listing_requests").insertOne({
    storeId: store._id.toString(),
    requestedBy: auth.user!.id,
    orderId,
    orderDate,
    noOfProducts: validItems.length,
    items: validItems.map((i: { productId: string; quantity: string | number }) => ({
      productId: i.productId,
      quantity: Number(i.quantity),
    })),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ ok: true, requestId: result.insertedId }, { status: 201 });
}
