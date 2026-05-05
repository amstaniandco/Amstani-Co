import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/db";
import { User } from "../../../../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.id as string;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstanico");
    
    const user = await db.collection<User>("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Don't return password
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, addresses } = body;

    const updateData: Partial<User> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (addresses !== undefined) updateData.addresses = addresses;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
