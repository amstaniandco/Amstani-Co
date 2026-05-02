import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../lib/db";
import { User } from "../../../../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");
    const usersCollection = db.collection<User>("users");

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    // @ts-ignore
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id?.toString() || user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie for 7 days
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: false, // Accessible to JS for the Header component
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id?.toString() || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          state: user.state,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
