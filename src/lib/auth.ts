import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export type TokenPayload = {
  id: string;
  role: "user" | "owner" | "admin";
};

export async function getUserFromToken(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return {
      id: payload.id as string,
      role: payload.role as "user" | "owner" | "admin",
    };
  } catch {
    return null;
  }
}
