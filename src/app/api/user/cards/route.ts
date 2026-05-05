import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/db";
import { User, PaymentMethod } from "../../../../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.id as string;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const newCard: PaymentMethod = body.card;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $push: { paymentMethods: newCard } as any } // MongoDB push operator
    );

    return NextResponse.json({ message: "Card added" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/user/cards error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("id");
    if (!cardId) return NextResponse.json({ error: "Card ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { paymentMethods: { id: cardId } } as any }
    );

    return NextResponse.json({ message: "Card deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/user/cards error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
