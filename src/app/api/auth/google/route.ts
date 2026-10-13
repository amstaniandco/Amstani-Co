import { NextResponse } from "next/server";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export function GET(request: Request) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_not_configured`);
  }

  const next = new URL(request.url).searchParams.get("next") ?? "";
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  if (next.startsWith("/")) params.set("state", next);

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
