import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { PaymentMethod } from "../../../../models/user";

function getUserObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCard(card: Partial<PaymentMethod>) {
  const provider = cleanString(card.provider) || "Card";
  const last4 = cleanString(card.last4);
  const expiry = cleanString(card.expiry);

  if (!/^\d{4}$/.test(last4)) return null;
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return null;

  const [month] = expiry.split("/").map(Number);
  if (month < 1 || month > 12) return null;

  return {
    id: cleanString(card.id) || crypto.randomUUID(),
    provider,
    last4,
    expiry,
    stripePaymentMethodId: cleanString(card.stripePaymentMethodId) || undefined,
  } satisfies PaymentMethod;
}

export async function POST(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const body = await req.json();
    const newCard = normalizeCard(body.card ?? {});
    if (!newCard) return NextResponse.json({ error: "Card data required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection("users").updateOne(
      { _id: userId },
      {
        $push: { paymentMethods: newCard } as never,
        $set: { updatedAt: new Date() },
      }
    );

    if (!result.matchedCount) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "Card added", card: newCard }, { status: 201 });
  } catch (error) {
    console.error("POST /api/user/cards error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = getUserObjectId(tokenUser.id);
    if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("id");
    if (!cardId) return NextResponse.json({ error: "Card ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection("users").updateOne(
      { _id: userId },
      {
        $pull: { paymentMethods: { id: cardId } } as never,
        $set: { updatedAt: new Date() },
      }
    );

    if (!result.matchedCount) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "Card deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/user/cards error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
