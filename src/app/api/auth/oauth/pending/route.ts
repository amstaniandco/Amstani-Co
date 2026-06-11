import { NextResponse } from "next/server";
import * as jose from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export async function GET() {
  const cookieStore = await cookies();
  const pendingCookie = cookieStore.get("pending_oauth");

  if (!pendingCookie?.value) {
    return NextResponse.json({ error: "No pending OAuth session" }, { status: 404 });
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(pendingCookie.value, secret);

    const { provider, name, email } = payload as {
      provider?: string;
      name?: string;
      email?: string;
    };

    return NextResponse.json({ provider, name, email });
  } catch {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 400 });
  }
}
