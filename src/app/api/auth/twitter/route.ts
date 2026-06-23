import { NextResponse } from "next/server";
import crypto from "crypto";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Initiate Twitter/X OAuth 2.0 with PKCE.
export function GET() {
  if (!process.env.TWITTER_CLIENT_ID) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_not_configured`);
  }

  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
  const state = base64url(crypto.randomBytes(16));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/twitter/callback`,
    scope: "tweet.read users.read offline.access",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const response = NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
  // Stash the PKCE verifier + state so the callback can verify and exchange the code
  response.cookies.set("twitter_oauth", JSON.stringify({ state, verifier }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60,
    path: "/",
  });
  return response;
}
