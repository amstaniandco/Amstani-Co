"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// ── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
    />
  </svg>
);

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

// ── Logo ─────────────────────────────────────────────────────────────────────

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 shrink-0">
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="8"
        width="5"
        height="18"
        rx="2.5"
        transform="rotate(-30 2 8)"
        fill="#4DB8B8"
      />
      <rect
        x="9"
        y="8"
        width="5"
        height="18"
        rx="2.5"
        transform="rotate(-30 9 8)"
        fill="#4DB8B8"
        opacity="0.6"
      />
    </svg>
    <span className="text-white font-bold tracking-widest text-sm uppercase">
      Amstani <span className="text-gray-400 font-light">&amp; Co.</span>
    </span>
  </Link>
);

// ── Nav links config ──────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Sale", href: "/sale" },
  { label: "New Arrivals", href: "/new-arrivals" },
];

// ── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [city, setCity] = useState("New York");
  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get("q") ?? ""
  );
  const token = "mock-token"; // Replace with actual authentication logic
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    const query = searchQuery.trim();
    if (!query) {
      router.replace("/our-products", { scroll: false });
      return;
    }
    router.replace(`/our-products?q=${encodeURIComponent(query)}`, {
      scroll: false,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const query = value.trim();

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    if (pathname !== "/our-products") {
      searchTimeoutRef.current = window.setTimeout(() => {
        if (query) {
          router.replace(`/our-products?q=${encodeURIComponent(query)}`, {
            scroll: false,
          });
        } else {
          router.replace("/our-products", { scroll: false });
        }
      }, 150);
      return;
    }

    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url);
  };

  useEffect(() => {
    if (pathname === "/our-products") {
      searchRef.current?.focus();
    }
  }, [pathname]);

  return (
    <header className="w-full bg-[#1a1a2e] border-b border-white/10 px-8 py-5 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-8">
        {/* Logo */}
        <Logo />

        {token ? (
          <>
            {/* Nav Links */}
            <nav className="flex items-center gap-5 ml-4">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    pathname === href
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 mx-4">
              <div className="relative max-w-xs">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search a Products"
                  className="w-full bg-transparent border border-white/20 rounded-full px-5 py-2 pr-10 text-sm text-gray-300 placeholder-gray-500 outline-none focus:border-[#4DB8B8]/60 transition-colors duration-200"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4DB8B8] transition-colors duration-200"
                >
                  <SearchIcon />
                </button>
              </div>
            </form>
          </>
        ) : null}

        {token ? (
          <>
            {/* Location Selector */}
            <div className="flex items-center border border-white/20 rounded-full overflow-hidden text-sm shrink-0">
              <span className="px-4 py-2 text-white text-sm">{city}</span>
              <button
                onClick={() =>
                  setCity((prev) =>
                    prev === "New York" ? "Los Angeles" : "New York",
                  )
                }
                className="bg-[#4DB8B8] text-white text-sm font-semibold px-4 py-2 hover:bg-[#3aa3a3] transition-colors duration-200"
              >
                Change
              </button>
            </div>

            {/* Icon Actions */}
            <div className="flex items-center gap-4 text-gray-400 shrink-0">
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="hover:text-white transition-colors duration-200"
              >
                <HeartIcon />
              </Link>

              <Link
                href="/cart"
                aria-label="Cart"
                className="hover:text-white transition-colors duration-200 relative"
              >
                <CartIcon />
              </Link>

              <Link
                href="/notifications"
                aria-label="Notifications"
                className="hover:text-white transition-colors duration-200"
              >
                <BellIcon />
              </Link>

              {/* Avatar — replace src with your actual user image or session data */}
              <Link
                href="/profile"
                aria-label="Profile"
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#4DB8B8]/50 hover:border-[#4DB8B8] transition-colors duration-200"
              >
                <Image
                  src="https://i.pravatar.cc/64?img=47"
                  alt="User Avatar"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/signup"
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#4DB8B8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3aa3a3] transition-colors duration-200"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
