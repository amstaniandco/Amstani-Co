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

  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_not_configured`);
  }

  try {
    const redirectUri = `${APP_URL}/api/auth/facebook/callback`;

    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("code", code);
    tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID);
    tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);

    const tokenResponse = await fetch(tokenUrl.toString());

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    const tokenData = await tokenResponse.json() as { access_token?: string };
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    // Get user profile from Facebook
    const userInfoUrl = new URL("https://graph.facebook.com/me");
    userInfoUrl.searchParams.set("fields", "id,name,email");
    userInfoUrl.searchParams.set("access_token", accessToken);

    const userInfoResponse = await fetch(userInfoUrl.toString());

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    const userInfo = await userInfoResponse.json() as {
      id?: string;
      name?: string;
      email?: string;
    };

    const facebookId = userInfo.id;
    const name = userInfo.name ?? "";
    const email = userInfo.email ?? "";

    if (!facebookId) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    // Look up user in DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");

    const query = email
      ? { $or: [{ facebookId }, { email }] }
      : { facebookId };

    let user = await usersCollection.findOne(query);

    if (user) {
      // If found by email but no facebookId, patch it
      if (!user.facebookId) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { facebookId, updatedAt: new Date() } }
        );
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
          : "/home";

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
      provider: "facebook",
      providerId: facebookId,
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
    console.error("Facebook OAuth callback error:", err);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}
