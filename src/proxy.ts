import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

// Define role-based protected paths
const ADMIN_PATHS = ["/admin"];
const OWNER_PATHS = [
  "/store",
  "/orders",
  "/performance",
  "/products",
  "/timings",
  "/owner",
];
const USER_PATHS = ["/home", "/cart", "/wishlist", "/profile"];

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  // Determine if the current path requires protection
  const isAdminPath = ADMIN_PATHS.some((p) => path.startsWith(p));
  const isOwnerPath = OWNER_PATHS.some((p) => path.startsWith(p));
  const isUserPath = USER_PATHS.some((p) => path.startsWith(p));

  const isProtectedPath = isAdminPath || isOwnerPath || isUserPath;

  if (isProtectedPath) {
    if (!token) {
      // Not authenticated, redirect to login
      const url = new URL("/login", req.url);
      url.searchParams.set("message", "Please log in to continue");
      return NextResponse.redirect(url);
    }

    try {
      // Verify token using jose (Edge compatible)
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const role = payload.role as string;

      // Role checks
      if (isAdminPath && role !== "admin") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      if (isOwnerPath && role !== "owner") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

    } catch (error) {
      // Invalid token, clear cookie and redirect
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // Redirect authenticated users away from login/signup
  if (token && (path === "/login" || path === "/signup" || path === "/store-signup")) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const role = payload.role as string;

      if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "owner") return NextResponse.redirect(new URL("/store/chats", req.url));
      return NextResponse.redirect(new URL("/home", req.url));
    } catch (e) {
      // Token invalid, let them stay on login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets|us-states.json).*)",
  ],
};
