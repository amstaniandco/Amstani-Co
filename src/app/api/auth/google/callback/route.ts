import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_not_configured`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    const tokenData = await tokenResponse.json() as { access_token?: string };
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    // Get user profile from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    const userInfo = await userInfoResponse.json() as {
      id?: string;
      name?: string;
      email?: string;
    };

    const googleId = userInfo.id;
    const name = userInfo.name ?? "";
    const email = userInfo.email ?? "";

    if (!googleId || !email) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    // Look up user in DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");

    let user = await usersCollection.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // If found by email but no googleId, patch it
      if (!user.googleId) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { googleId, updatedAt: new Date() } }
        );
      }

      // Existing user without a state must still pick one before continuing
      if (!user.state) {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const pendingToken = await new jose.SignJWT({
          provider: "google",
          providerId: googleId,
          name,
          email,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("15m")
          .sign(secret);

        const response = NextResponse.redirect(`${APP_URL}/signup/oauth-state`);
        response.cookies.set("pending_oauth", pendingToken, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 15 * 60,
          path: "/",
        });
        return response;
      }

      // Issue auth JWT and redirect
      const secret = new TextEncoder().encode(JWT_SECRET);
      const token = await new jose.SignJWT({ id: user._id.toString(), role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(secret);

      const redirectPath =
        user.role === "admin"
          ? "/admin/dashboard"
          : user.role === "owner"
          ? "/owner/profile"
          : "/";

      const response = NextResponse.redirect(`${APP_URL}${redirectPath}`);
      response.cookies.set("token", token, {
        httpOnly: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    // New user — set pending_oauth cookie and redirect to state selection
    const secret = new TextEncoder().encode(JWT_SECRET);
    const pendingToken = await new jose.SignJWT({
      provider: "google",
      providerId: googleId,
      name,
      email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(secret);

    const response = NextResponse.redirect(`${APP_URL}/signup/oauth-state`);
    response.cookies.set("pending_oauth", pendingToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}
