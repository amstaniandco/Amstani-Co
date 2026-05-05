import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "../../../../lib/db";
import { User } from "../../../../models/user";

export async function POST(req: Request) {
  try {
    const { name, email, password, state } = await req.json();

    if (!name || !email || !password || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DBNAME || "amstani");
    const usersCollection = db.collection<User>("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      state,
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser as any);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: result.insertedId.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          state: newUser.state,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
