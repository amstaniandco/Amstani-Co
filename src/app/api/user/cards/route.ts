import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { PaymentMethod } from "../../../../models/user";

export async function POST(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const newCard: PaymentMethod = body.card;
    if (!newCard) return NextResponse.json({ error: "Card data required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection("users").updateOne(
      { _id: new ObjectId(tokenUser.id) },
      { $push: { paymentMethods: newCard } as any }
    );

    return NextResponse.json({ message: "Card added" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/user/cards error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("id");
    if (!cardId) return NextResponse.json({ error: "Card ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection("users").updateOne(
      { _id: new ObjectId(tokenUser.id) },
      { $pull: { paymentMethods: { id: cardId } } as any }
    );

    return NextResponse.json({ message: "Card deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/user/cards error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
