import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production-12345"
);

type UserRole = "admin" | "owner" | "user";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/landing", "/store-signup"]);

const CUSTOMER_PATH_PREFIXES = [
  "/home",
  "/cart",
  "/checkout",
  "/claims",
  "/form",
  "/new-arrivals",
  "/notifications",
  "/our-products",
  "/product",
  "/profile",
  "/sale",
  "/store",
  "/wishlist",
];

const OWNER_PATH_PREFIXES = [
  "/owner",
  "/chats",
  "/orders",
  "/performance",
  "/products",
  "/timings",
  "/communications",
  "/music",
];

function isStaticAsset(pathname: string): boolean {
  return /\.[^/]+$/.test(pathname);
}

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getRequiredRole(pathname: string): UserRole | null {
  if (hasPrefix(pathname, "/admin")) {
    return "admin";
  }

  if (OWNER_PATH_PREFIXES.some((prefix) => hasPrefix(pathname, prefix))) {
    return "owner";
  }

  if (CUSTOMER_PATH_PREFIXES.some((prefix) => hasPrefix(pathname, prefix))) {
    return "user";
  }

  return null;
}

interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

async function verifyAuth(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    isStaticAsset(pathname)
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const requiredRole = getRequiredRole(pathname);

  // If route doesn't require specific role, allow access
  if (!requiredRole) {
    return NextResponse.next();
  }

  // Get JWT token from cookies
  const token = request.cookies.get("token")?.value;

  if (!token) {
    // No token, redirect to login
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Verify token and extract role
  const payload = await verifyAuth(token);

  if (!payload) {
    // Invalid token, redirect to login
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Check if user's role matches required role
  if (payload.role !== requiredRole) {
    // Role mismatch, redirect to user's home page
    let homeUrl = "/login";
    if (payload.role === "admin") {
      homeUrl = "/admin";
    } else if (payload.role === "owner") {
      homeUrl = "/owner";
    } else if (payload.role === "user") {
      homeUrl = "/home";
    }
    return NextResponse.redirect(new URL(homeUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
