import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

// Only customers (role: "user") can access these
const CUSTOMER_ONLY = [
  "/home", "/cart", "/checkout", "/profile", "/wishlist",
  "/product", "/our-products", "/new-arrivals", "/sale",
  "/notifications", "/claims", "/form", "/store",
];

// Only owners (role: "owner") can access these
const OWNER_ONLY = [
  "/orders", "/products", "/performance", "/timings",
  "/communications", "/music", "/owner", "/chats",
  "/store/chats", "/store/apply", "/store/stripe",
];

// Only admins (role: "admin") can access these
const ADMIN_ONLY = ["/admin"];

function matchPath(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

async function getRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.role as string;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isCustomerOnly = matchPath(pathname, CUSTOMER_ONLY);
  const isOwnerOnly    = matchPath(pathname, OWNER_ONLY);
  const isAdminOnly    = matchPath(pathname, ADMIN_ONLY);
  const isProtected    = isCustomerOnly || isOwnerOnly || isAdminOnly;

  // Not logged in — redirect to login for any protected route
  if (isProtected) {
    const role = await getRole(req);

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // OWNER blocked from customer + admin pages → owner profile
    if (role === "owner" && (isCustomerOnly || isAdminOnly)) {
      // Allow owners to preview the public store page (read-only customer view)
      if (pathname === "/store" || (pathname.startsWith("/store/") && !isOwnerOnly)) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/owner/profile", req.url));
    }

    // ADMIN blocked from customer + owner pages → admin dashboard
    if (role === "admin" && (isCustomerOnly || isOwnerOnly)) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // CUSTOMER blocked from owner + admin pages → customer home
    if (role === "user" && (isOwnerOnly || isAdminOnly)) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  // Already logged in — redirect away from login/signup to correct dashboard
  if (pathname === "/login" || pathname === "/signup") {
    const role = await getRole(req);
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (role === "owner") return NextResponse.redirect(new URL("/owner/profile", req.url));
    if (role === "user")  return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|us-states.json).*)",
  ],
};
