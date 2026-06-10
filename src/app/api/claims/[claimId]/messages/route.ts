import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { createNotification } from "../../../../../lib/notify";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ claimId: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { claimId } = await params;
  if (!ObjectId.isValid(claimId)) {
    return NextResponse.json({ error: "Invalid claimId" }, { status: 400 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const claim = await db.collection("claims").findOne({ _id: new ObjectId(claimId) });
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  if (user.role === "user" && claim.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: any = null;
  if (user.role === "owner") {
    store = await db
      .collection("stores")
      .findOne({ ownerId: new ObjectId(user.id) });
    if (!store || claim.storeId !== store._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const userDoc = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user.id) }, { projection: { name: 1 } });

  const now = new Date();
  const senderName = userDoc?.name || user.role;
  const message = {
    senderId: user.id,
    senderName,
    senderRole: user.role,
    content: content.trim(),
    timestamp: now,
  };

  const setFields: Record<string, unknown> = { updatedAt: now };
  if (user.role === "owner") {
    setFields.status = "owner_responded";
    setFields.ownerLastActionAt = now;
  }

  await db.collection("claims").updateOne(
    { _id: new ObjectId(claimId) },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { $push: { messages: message } as any, $set: setFields }
  );

  // Resolve store doc once for all notification branches
  if (!store && ObjectId.isValid(claim.storeId)) {
    store = await db.collection("stores").findOne({ _id: new ObjectId(claim.storeId) });
  }

  if (user.role === "owner") {
    await createNotification({
      userId: claim.customerId,
      title: "Store Owner Replied to Your Claim",
      message: `${senderName} replied to your claim #${claim.claimNumber}: "${content.trim().slice(0, 100)}"`,
      referenceId: claimId,
    });
  } else if (user.role === "user") {
    if (store?.ownerId) {
      await createNotification({
        userId: store.ownerId.toString(),
        title: "Customer Replied on Claim",
        message: `${senderName} replied on claim #${claim.claimNumber}: "${content.trim().slice(0, 100)}"`,
        referenceId: claimId,
      });
    }
  } else if (user.role === "admin") {
    // Admin replied → notify both customer and store owner
    await createNotification({
      userId: claim.customerId,
      title: "Admin Replied to Your Claim",
      message: `Admin replied on claim #${claim.claimNumber}: "${content.trim().slice(0, 100)}"`,
      referenceId: claimId,
    });
    if (store?.ownerId) {
      await createNotification({
        userId: store.ownerId.toString(),
        title: "Admin Commented on Claim",
        message: `Admin replied on claim #${claim.claimNumber}: "${content.trim().slice(0, 100)}"`,
        referenceId: claimId,
      });
    }
  }

  return NextResponse.json({ ok: true, message });
}
