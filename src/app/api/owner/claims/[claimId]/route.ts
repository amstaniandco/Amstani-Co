import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../../lib/db";
import { getUserFromToken } from "../../../../../lib/auth";
import { createNotification } from "../../../../../lib/notify";

function replacementOrderNumber() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `REPL-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

// Reasons that auto-trigger a replacement shipment
const RESEND_REASONS = new Set(["damaged", "missing", "other"]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ claimId: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { claimId } = await params;
  if (!ObjectId.isValid(claimId)) {
    return NextResponse.json({ error: "Invalid claimId" }, { status: 400 });
  }

  const body = await req.json();
  const { status, action, resolveProofUrls } = body;

  if (action !== "request_resolve" && !["resolved", "owner_responded"].includes(status)) {
    return NextResponse.json({ error: "Invalid action or status" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const store = await db
    .collection("stores")
    .findOne({ ownerId: new ObjectId(user.id) });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const claim = await db
    .collection("claims")
    .findOne({ _id: new ObjectId(claimId), storeId: store._id.toString() });
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  // ── REQUEST ADMIN APPROVAL TO RESOLVE ────────────────────────────────────
  if (action === "request_resolve") {
    if (!resolveProofUrls?.length) {
      return NextResponse.json({ error: "Please upload at least one proof image before requesting approval." }, { status: 400 });
    }
    const now = new Date();
    await db.collection("claims").updateOne(
      { _id: new ObjectId(claimId) },
      { $set: { resolveRequestPending: true, resolveProofUrls: resolveProofUrls ?? [], updatedAt: now } }
    );

    // Notify all admins
    const admins = await db.collection("users").find({ role: "admin" }, { projection: { _id: 1 } }).toArray();
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin._id.toString(),
          title: "Owner Requesting Resolve Approval",
          message: `Store "${store.name || "owner"}" is requesting admin approval to resolve claim #${claim.claimNumber}.`,
          referenceId: claimId,
        })
      )
    );

    return NextResponse.json({ ok: true });
  }

  const now = new Date();
  const reason: string = claim.reason;

  // Determine resolution type from reason
  let resolutionType: string;
  let newStatus: string;

  if (status !== "resolved") {
    // Just marking as "owner_responded" — no resolution action yet
    resolutionType = "none";
    newStatus = status;
  } else if (claim.status === "awaiting_reorder") {
    // Customer was asked to reorder; owner is now marking it fully resolved
    resolutionType = "reorder_completed";
    newStatus = "resolved";
  } else if (RESEND_REASONS.has(reason)) {
    resolutionType = "replacement";
    newStatus = "resolved";
  } else if (reason === "wrong") {
    resolutionType = "reorder";
    newStatus = "awaiting_reorder";
  } else {
    // refund or unknown — mark resolved, action TBD
    resolutionType = "pending_refund";
    newStatus = "resolved";
  }

  await db.collection("claims").updateOne(
    { _id: new ObjectId(claimId) },
    {
      $set: {
        status: newStatus,
        resolutionType: resolutionType === "none" ? undefined : resolutionType,
        ownerLastActionAt: now,
        updatedAt: now,
      },
    }
  );

  // ── REORDER COMPLETED (wrong item, customer reordered) ──────────────────
  if (resolutionType === "reorder_completed") {
    await createNotification({
      userId: claim.customerId,
      title: "Claim Resolved",
      message: `Your claim #${claim.claimNumber} has been marked as resolved by the store owner.`,
      referenceId: claimId,
    });
  }

  // ── REPLACEMENT (damaged / missing / other) ──────────────────────────────
  if (resolutionType === "replacement") {
    const [originalOrder, claimUserDoc] = await Promise.all([
      ObjectId.isValid(claim.orderId)
        ? db.collection("orders").findOne({ _id: new ObjectId(claim.orderId) })
        : Promise.resolve(null),
      ObjectId.isValid(claim.customerId)
        ? db.collection("users").findOne({ _id: new ObjectId(claim.customerId) }, { projection: { email: 1 } })
        : Promise.resolve(null),
    ]);

    const replacementItems = claim.items.map((item: Record<string, unknown>) => ({
      productId: item.productId,
      name: item.name,
      sku: "",
      price: item.price,
      mainImage: item.image ?? null,
      quantity: item.quantity,
      selectedVariants: {},
    }));

    const subtotal = claim.items.reduce(
      (s: number, i: Record<string, unknown>) =>
        s + Number(i.price ?? 0) * Number(i.quantity ?? 1),
      0
    );

    await db.collection("orders").insertOne({
      orderNumber: replacementOrderNumber(),
      customerId: claim.customerId,
      customerName: claim.customerName,
      customerEmail: originalOrder?.customerEmail || claimUserDoc?.email || "",
      storeId: claim.storeId,
      storeName: claim.storeName,
      items: replacementItems,
      subtotal,
      shippingFee: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: subtotal,
      status: "Incoming",
      paymentStatus: "Replacement",
      paymentMethod: "Replacement",
      shippingAddress: originalOrder?.shippingAddress ?? {},
      billingAddress: originalOrder?.billingAddress ?? {},
      notes: `Replacement for claim #${claim.claimNumber} (${reason})`,
      isReplacement: true,
      originalClaimId: claimId,
      createdAt: now,
      updatedAt: now,
    });

    const reasonLabel =
      reason === "damaged"
        ? "damaged item"
        : reason === "missing"
        ? "missing item"
        : "your issue";

    await createNotification({
      userId: claim.customerId,
      title: "Replacement Order Created",
      message: `The store owner resolved your claim #${claim.claimNumber} for a ${reasonLabel}. A replacement order has been placed — check your order history.`,
      referenceId: claimId,
    });
  }

  // ── WRONG ITEM — customer must reorder ───────────────────────────────────
  if (resolutionType === "reorder") {
    await createNotification({
      userId: claim.customerId,
      title: "Wrong Item Acknowledged — Please Reorder",
      message: `The store owner has reviewed your wrong item claim #${claim.claimNumber}. Please visit the store and place a new order for the correct product.`,
      referenceId: claimId,
    });
  }

  // ── REFUND (pending future implementation) ───────────────────────────────
  if (resolutionType === "pending_refund") {
    await createNotification({
      userId: claim.customerId,
      title: "Refund Request Noted",
      message: `Your refund request for claim #${claim.claimNumber} has been acknowledged. Our team will process it shortly.`,
      referenceId: claimId,
    });
  }

  return NextResponse.json({ ok: true, resolutionType });
}
