import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function GET() {
  if (!process.env.FACEBOOK_APP_ID) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_not_configured`);
  }

  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: `${APP_URL}/api/auth/facebook/callback`,
    scope: "email,public_profile",
    response_type: "code",
  });

  return NextResponse.redirect(
    `https://www.facebook.com/v18.0/dialog/oauth?${params}`
  );
}
