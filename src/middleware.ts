import { NextRequest, NextResponse } from "next/server";

type DemoRole = "admin" | "customer" | "owner";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/landing"]);

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
  "/store/chats",
  "/store/apply",
  "/chats",
  "/orders",
  "/performance",
  "/products",
  "/timings",
  "/communications",
  "/music",
  "/owner",
];

function isStaticAsset(pathname: string): boolean {
  return /\.[^/]+$/.test(pathname);
}

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getRequiredRole(pathname: string): DemoRole | null {
  if (hasPrefix(pathname, "/admin")) {
    return "admin";
  }

  if (OWNER_PATH_PREFIXES.some((prefix) => hasPrefix(pathname, prefix))) {
    return "owner";
  }

  if (CUSTOMER_PATH_PREFIXES.some((prefix) => hasPrefix(pathname, prefix))) {
    return "customer";
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    isStaticAsset(pathname)
  ) {
    return NextResponse.next();
  }

  const role = request.cookies.get("amstani_demo_role")?.value as DemoRole | undefined;
  const token = request.cookies.get("amstani_demo_token")?.value;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const requiredRole = getRequiredRole(pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  if (!role || !token || role !== requiredRole) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
