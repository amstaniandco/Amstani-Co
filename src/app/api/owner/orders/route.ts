import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import {
  sendEmail,
  orderAcceptedEmail,
  orderOnHoldEmail,
  orderStatusUpdateEmail,
} from "../../../../lib/email";

// Maps a new order status → which automated-template toggle gates it and which email to build.
const STATUS_EMAIL: Record<
  string,
  { toggle: "orderAcceptance" | "orderOnHold" | "statusUpdate" }
> = {
  // Accept/reject are a single decision, so both are gated by the Order Acceptance toggle.
  Accepted: { toggle: "orderAcceptance" },
  Rejected: { toggle: "orderAcceptance" },
  "On Hold": { toggle: "orderOnHold" },
  Dispatched: { toggle: "statusUpdate" },
  Shipped: { toggle: "statusUpdate" },
  Delivered: { toggle: "statusUpdate" },
};

const DEFAULT_TEMPLATES = { orderAcceptance: true, orderOnHold: true, statusUpdate: false };

const validStatuses = ["Incoming", "Accepted", "Rejected", "On Hold", "Dispatched", "Shipped", "Delivered"];

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ orders: [] });
  const storeId = store._id.toString();

  const orders = await db
    .collection("orders")
    .find({ $or: [{ storeId }, { storeId: store._id }] })
    .sort({ createdAt: -1 })
    .toArray();

  // Backfill customerEmail for replacement orders that are missing it
  const missingEmailIds = orders
    .filter((o) => o.isReplacement && !o.customerEmail && o.customerId && ObjectId.isValid(o.customerId))
    .map((o) => new ObjectId(o.customerId));

  if (missingEmailIds.length) {
    const users = await db
      .collection("users")
      .find({ _id: { $in: missingEmailIds } }, { projection: { _id: 1, email: 1 } })
      .toArray();
    const emailMap = new Map(users.map((u) => [u._id.toString(), u.email ?? ""]));
    for (const order of orders) {
      if (order.isReplacement && !order.customerEmail && order.customerId) {
        order.customerEmail = emailMap.get(order.customerId.toString()) ?? "";
      }
    }
  }

  return NextResponse.json({ orders, storeName: store.name });
}

export async function PATCH(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderId, status } = await req.json();
  if (!orderId || !ObjectId.isValid(orderId) || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid orderId or status" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const store = await db.collection("stores").findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const result = await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId), $or: [{ storeId: store._id.toString() }, { storeId: store._id }] },
    { $set: { status, updatedAt: new Date() } }
  );

  if (!result.matchedCount) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Send the automated customer email for this status change, if the store has the
  // matching template toggle enabled. Non-blocking — email failures never fail the request.
  const mapping = STATUS_EMAIL[status];
  if (mapping) {
    const templates = { ...DEFAULT_TEMPLATES, ...(store.automatedTemplates ?? {}) };
    if (templates[mapping.toggle]) {
      const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
      if (order?.customerEmail) {
        const data = {
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          storeName: order.storeName ?? store.name,
          items: order.items,
          total: order.total,
        };
        const built =
          status === "Accepted"
            ? orderAcceptedEmail(data)
            : status === "On Hold"
            ? orderOnHoldEmail(data)
            : orderStatusUpdateEmail({ ...data, status });
        void sendEmail({ to: order.customerEmail, subject: built.subject, html: built.html });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
