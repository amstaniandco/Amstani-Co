import { NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/src/lib/db";

/**
 * POST /api/auth/test-user
 * Creates a test user for development/testing
 * Demo credentials: test@example.com / password123
 */
export async function POST() {
  try {
    const testEmail = "test@example.com";
    const testPassword = "password123";
    const testName = "Test User";

    // Check if test user already exists
    const existingUser = await getUserByEmail(testEmail);
    if (existingUser) {
      return NextResponse.json(
        {
          message: "Test user already exists",
          email: testEmail,
          password: testPassword,
          note: "Use these credentials to login",
        },
        { status: 200 }
      );
    }

    // Create test user
    const newUser = await createUser(testEmail, testName, testPassword, "user");

    return NextResponse.json(
      {
        message: "Test user created successfully",
        email: testEmail,
        password: testPassword,
        user: newUser,
        note: "Use these credentials to login at /login",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test user:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create test user";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
