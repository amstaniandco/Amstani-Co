import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { cookies } from "next/headers";
import clientPromise, { DB_NAME } from "../../../../../lib/db";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

function fail() {
  return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) return fail();

  if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_not_configured`);
  }

  // Recover the PKCE verifier + state from the cookie set during initiation
  const cookieStore = await cookies();
  const raw = cookieStore.get("twitter_oauth")?.value;
  if (!raw) return fail();
  let saved: { state?: string; verifier?: string };
  try {
    saved = JSON.parse(raw);
  } catch {
    return fail();
  }
  if (!saved.state || !saved.verifier || saved.state !== state) return fail();

  try {
    const redirectUri = `${APP_URL}/api/auth/twitter/callback`;
    const basic = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
    ).toString("base64");

    // Exchange code for an access token
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: saved.verifier,
        client_id: process.env.TWITTER_CLIENT_ID,
      }),
    });

    if (!tokenResponse.ok) return fail();
    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    const accessToken = tokenData.access_token;
    if (!accessToken) return fail();

    // Fetch the user profile (Twitter does not return email without elevated access)
    const userInfoResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userInfoResponse.ok) return fail();

    const userInfo = (await userInfoResponse.json()) as {
      data?: { id?: string; name?: string; username?: string };
    };
    const twitterId = userInfo.data?.id;
    const name = userInfo.data?.name ?? userInfo.data?.username ?? "";
    const email = ""; // not provided by Twitter by default

    if (!twitterId) return fail();

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ twitterId });

    // Existing user with a state set → log straight in
    if (user && user.state) {
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
      response.cookies.set("twitter_oauth", "", { maxAge: 0, path: "/" });
      return response;
    }

    // New user (or existing user missing a state) → collect state before finishing
    const secret = new TextEncoder().encode(JWT_SECRET);
    const pendingToken = await new jose.SignJWT({
      provider: "twitter",
      providerId: twitterId,
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
    response.cookies.set("twitter_oauth", "", { maxAge: 0, path: "/" });
    return response;
  } catch (err) {
    console.error("Twitter OAuth callback error:", err);
    return fail();
  }
}
