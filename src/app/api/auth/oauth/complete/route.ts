import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { cookies } from "next/headers";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const pendingCookie = cookieStore.get("pending_oauth");

  if (!pendingCookie?.value) {
    return NextResponse.json({ error: "No pending OAuth session" }, { status: 401 });
  }

  let pendingPayload: {
    provider?: string;
    providerId?: string;
    name?: string;
    email?: string;
  };

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(pendingCookie.value, secret);
    pendingPayload = payload as typeof pendingPayload;
  } catch {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const { provider, providerId, name, email } = pendingPayload;

  if (!provider || !providerId) {
    return NextResponse.json({ error: "Malformed pending session" }, { status: 400 });
  }

  let body: { state?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { state } = body;

  if (!state) {
    return NextResponse.json({ error: "State is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");

    // Check if user already exists (race condition guard)
    const providerIdField = `${provider}Id`;
    const query = email
      ? { $or: [{ [providerIdField]: providerId }, { email }] }
      : { [providerIdField]: providerId };

    let user = await usersCollection.findOne(query);

    if (!user) {
      // Create new user
      const now = new Date();
      const newUser = {
        name: name ?? "",
        email: email ?? "",
        state,
        role: "user",
        [providerIdField]: providerId,
        createdAt: now,
        updatedAt: now,
      };

      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // Patch providerIdField and/or a missing state on the existing account
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (!user[providerIdField]) patch[providerIdField] = providerId;
      if (!user.state) patch.state = state;
      if (Object.keys(patch).length > 1) {
        await usersCollection.updateOne({ _id: user._id }, { $set: patch });
      }
    }

    // Issue auth JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({
      id: user._id.toString(),
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({ ok: true, role: user.role });

    // Set auth cookie
    response.cookies.set("token", token, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // Delete pending_oauth cookie
    response.cookies.set("pending_oauth", "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("OAuth complete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
