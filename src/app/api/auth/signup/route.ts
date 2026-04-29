import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/src/lib/db";
import { createToken } from "@/src/lib/auth/authUtils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, confirmPassword, state } = body;

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Only check confirmPassword if it's provided (from 2-step flow)
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create new user with "user" role by default
    const newUser = await createUser(email, name, password, "user", state);

    // Create JWT token
    const token = createToken({
      id: newUser._id || newUser.id || "",
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: newUser._id || newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          state: newUser.state,
        },
        token,
      },
      { status: 201 }
    );

    // Set token as httpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: errorMessage || "Internal server error" },
      { status: 500 }
    );
  }
}
