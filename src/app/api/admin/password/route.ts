import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";

const MIN_PASSWORD_LENGTH = 8;

export async function PUT(req: Request) {
  try {
    const tokenUser = await getUserFromToken();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (tokenUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!ObjectId.isValid(tokenUser.id)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = (await req.json()) as { password?: unknown; confirmPassword?: unknown };
    if (typeof body.password !== "string" || typeof body.confirmPassword !== "string") {
      return NextResponse.json({ error: "Password and confirmation are required" }, { status: 400 });
    }
    if (body.password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` },
        { status: 400 },
      );
    }
    if (body.password !== body.confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);
    const client = await clientPromise;
    const result = await client
      .db(DB_NAME)
      .collection("users")
      .updateOne(
        { _id: new ObjectId(tokenUser.id), role: "admin" },
        { $set: { password: hashedPassword, updatedAt: new Date() } },
      );

    if (!result.matchedCount) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Password changed successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
