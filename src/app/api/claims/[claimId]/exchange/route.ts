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

type ClaimItem = {
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  variant?: string;
};

type ProductVariant = { size?: string; color?: string; stock?: number; stockQuantity?: number };

// GET /api/claims/[claimId]/exchange
// Returns the size/color options for each item on a wrong-item claim so the
// customer can pick a replacement variant instead of paying to reorder.
export async function GET(_req: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "user") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { claimId } = await params;
  if (!ObjectId.isValid(claimId)) return NextResponse.json({ error: "Invalid claimId" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const claim = await db.collection("claims").findOne({ _id: new ObjectId(claimId), customerId: user.id });
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  const items = (claim.items ?? []) as ClaimItem[];
  const productIds = items
    .map((i) => i.productId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  const products = productIds.length
    ? await db.collection("products").find({ _id: { $in: productIds } }).toArray()
    : [];
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const result = items.map((it) => {
    const product = byId.get(String(it.productId));
    const variants = ((product?.variants ?? []) as ProductVariant[]).map((v) => ({
      size: v.size != null ? String(v.size) : null,
      color: v.color != null ? String(v.color) : null,
      stock: v.stockQuantity ?? v.stock ?? null,
    }));
    const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean) as string[])];
    const colors = [...new Set(variants.map((v) => v.color).filter(Boolean) as string[])];
    return {
      productId: it.productId,
      name: it.name,
      image: it.image ?? null,
      price: it.price,
      quantity: it.quantity,
      currentVariant: it.variant ?? "",
      hasVariants: variants.length > 0,
      sizes,
      colors,
      variants,
    };
  });

  return NextResponse.json({ claimId, status: claim.status, items: result });
}

// POST /api/claims/[claimId]/exchange
// Body: { selections: [{ productId, size?, color? }] }
// Creates a replacement order (not re-charged) with the customer's chosen
// variants, cancels the original order, and resolves the wrong-item claim.
export async function POST(req: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "user") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { claimId } = await params;
  if (!ObjectId.isValid(claimId)) return NextResponse.json({ error: "Invalid claimId" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const selections = Array.isArray(body.selections) ? body.selections : [];
  if (!selections.length) {
    return NextResponse.json({ error: "Please choose a replacement for each item." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const claim = await db.collection("claims").findOne({ _id: new ObjectId(claimId), customerId: user.id });
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  if (claim.status !== "awaiting_reorder") {
    return NextResponse.json({ error: "This claim is not awaiting a replacement selection." }, { status: 400 });
  }

  const items = (claim.items ?? []) as ClaimItem[];
  // Selections are aligned to items by index, so multiple items of the same
  // product each get their own size/colour choice.
  if (selections.length !== items.length) {
    return NextResponse.json({ error: "Please choose a replacement for every item." }, { status: 400 });
  }

  const productIds = items
    .map((i) => i.productId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));
  const products = productIds.length
    ? await db.collection("products").find({ _id: { $in: productIds } }).toArray()
    : [];
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const replacementItems: Record<string, unknown>[] = [];
  const summaryParts: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const sel = selections[i] as { size?: string; color?: string } | undefined;
    const product = byId.get(String(it.productId));
    const variants = (product?.variants ?? []) as ProductVariant[];
    const selectedVariants: Record<string, string> = {};

    if (variants.length > 0) {
      if (!sel || (!sel.size && !sel.color)) {
        return NextResponse.json({ error: `Please choose a size or color for "${it.name}".` }, { status: 400 });
      }
      const match = variants.find((v) => {
        const sizeOk = !sel.size || String(v.size ?? "") === String(sel.size);
        const colorOk = !sel.color || String(v.color ?? "") === String(sel.color);
        return sizeOk && colorOk;
      });
      if (!match) {
        return NextResponse.json(
          { error: `That combination isn't available for "${it.name}". Please pick another.` },
          { status: 400 }
        );
      }
      if (sel.size) selectedVariants.size = String(sel.size);
      if (sel.color) selectedVariants.color = String(sel.color);
      summaryParts.push(
        `${it.name} → ${[sel.size && `Size ${sel.size}`, sel.color && `Color ${sel.color}`].filter(Boolean).join(", ")}`
      );
    }

    replacementItems.push({
      productId: it.productId,
      name: it.name,
      sku: "",
      price: it.price,
      mainImage: it.image ?? null,
      quantity: it.quantity,
      selectedVariants,
    });
  }

  const now = new Date();
  const [originalOrder, claimUserDoc, store] = await Promise.all([
    ObjectId.isValid(claim.orderId)
      ? db.collection("orders").findOne({ _id: new ObjectId(claim.orderId) })
      : Promise.resolve(null),
    ObjectId.isValid(claim.customerId)
      ? db.collection("users").findOne({ _id: new ObjectId(claim.customerId) }, { projection: { email: 1 } })
      : Promise.resolve(null),
    ObjectId.isValid(claim.storeId)
      ? db.collection("stores").findOne({ _id: new ObjectId(claim.storeId) }, { projection: { ownerId: 1, name: 1 } })
      : Promise.resolve(null),
  ]);

  const subtotal = replacementItems.reduce(
    (s, i) => s + Number(i.price ?? 0) * Number(i.quantity ?? 1),
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
    notes: `Exchange for claim #${claim.claimNumber} (wrong item)`,
    isReplacement: true,
    originalClaimId: claimId,
    createdAt: now,
    updatedAt: now,
  });

  const summary = summaryParts.length ? summaryParts.join("; ") : "the correct item";

  await db.collection("claims").updateOne(
    { _id: new ObjectId(claimId) },
    {
      $set: { status: "resolved", resolutionType: "exchange", updatedAt: now },
      $push: {
        messages: {
          senderId: user.id,
          senderName: claim.customerName || "Customer",
          senderRole: "user",
          content: `Replacement requested: ${summary}.`,
          timestamp: now,
        },
      } as never,
    }
  );

  // Cancel the original order the claim was filed against — it has been superseded
  // by the replacement order.
  if (ObjectId.isValid(claim.orderId)) {
    await db.collection("orders").updateOne(
      { _id: new ObjectId(claim.orderId) },
      {
        $set: {
          status: "Cancelled",
          cancelledAt: now,
          cancellationReason: `Replaced via claim #${claim.claimNumber}`,
          updatedAt: now,
        },
      }
    );
  }

  if (store?.ownerId) {
    await createNotification({
      userId: store.ownerId.toString(),
      title: "Replacement Order Placed",
      message: `The customer selected a replacement for claim #${claim.claimNumber} (${summary}). A new replacement order has been created in your orders, and the original order has been cancelled.`,
      referenceId: claimId,
    });
  }

  await createNotification({
    userId: claim.customerId,
    title: "Replacement Order Confirmed",
    message: `Your replacement for claim #${claim.claimNumber} has been confirmed (${summary}). Your original order has been cancelled and the store will ship the replacement shortly.`,
    referenceId: claimId,
  });

  return NextResponse.json({ ok: true });
}
