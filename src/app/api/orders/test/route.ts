import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { finalizeOrderStock } from "../../../../lib/order-stock";

export async function POST() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Sign in to complete a test order" }, { status: 401 });

  const db = (await clientPromise).db(DB_NAME);
  const latest = await db.collection("pending_checkouts")
    .findOne({ customerId: user.id }, { sort: { createdAt: -1 } });
  const pending = latest?.checkoutGroupId
    ? await db.collection("pending_checkouts").find({
        customerId: user.id,
        checkoutGroupId: latest.checkoutGroupId,
      }).toArray()
    : latest ? [latest] : [];

  if (!pending.length) {
    return NextResponse.json({ error: "Start checkout before completing a test order." }, { status: 400 });
  }

  const ids = pending.map((order) => order._id as ObjectId);
  await db.collection("orders").insertMany(
    pending.map((order) => ({
      ...order,
      paymentStatus: "Paid",
      testOrder: true,
      updatedAt: new Date(),
    })),
    { ordered: true },
  );
  await finalizeOrderStock(db, pending);
  await db.collection("pending_checkouts").deleteMany({ _id: { $in: ids } });
  await db.collection("carts").updateOne(
    { userId: user.id },
    { $set: { items: [], updatedAt: new Date() } },
  );

  return NextResponse.json({
    testOrder: true,
    orderIds: ids.map((id) => id.toString()),
  });
}
