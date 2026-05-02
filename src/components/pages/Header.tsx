"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

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

const HamburgerIcon = () => (
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
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
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
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
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
      Amstani <span className="text-gray-200 font-light">&amp; Co.</span>
    </span>
  </Link>
);

// ── Nav links config ──────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Sale", href: "/sale" },
  { label: "New Arrivals", href: "/new-arrivals" },
];

// ── Helper function ────────────────────────────────────────────────────────

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const encodedName = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(encodedName));

  if (!entry) return null;
  return decodeURIComponent(entry.slice(encodedName.length));
}

function hasActiveSession(): boolean {
  return Boolean(getCookieValue("token"));
}

// ── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const [city, setCity] = useState("New York");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  // Check authentication status on route change
  useEffect(() => {
    setIsLoggedIn(hasActiveSession());
  }, [pathname]);

  const showAuthenticatedNavbar = isLoggedIn;

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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsLoggedIn(false);
      setMobileMenuOpen(false);
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    if (pathname === "/our-products") {
      searchRef.current?.focus();
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/our-products") {
      const query = new URL(window.location.href).searchParams.get("q") ?? "";
      setSearchQuery(query);
      return;
    }

    setSearchQuery("");
  }, [pathname]);

  // Close mobile menu when clicking on a link
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full overflow-x-hidden border-b border-white/10 bg-[#151C1DCC] dark:bg-[#0b1220]">
      <div className="px-3 sm:px-4 md:px-8 py-4 md:py-5">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation - Hidden on mobile */}
          {showAuthenticatedNavbar && (
            <>
              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-5 ml-4">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      pathname === href
                        ? "text-white"
                        : "text-gray-200 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Desktop Search Bar */}
              <form
                onSubmit={handleSearch}
                className="hidden md:flex flex-1 mx-4"
              >
                <div className="relative max-w-xs w-full">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search a Products"
                    className="w-full bg-transparent border border-white/30 rounded-full px-5 py-2 pr-10 text-sm text-gray-100 placeholder-gray-300 outline-none focus:border-[#4DB8B8]/60 transition-colors duration-200"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 hover:text-[#4DB8B8] transition-colors duration-200"
                  >
                    <SearchIcon />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Desktop Auth Section - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            {showAuthenticatedNavbar ? (
              <>
                {/* Location Selector */}
                <div className="flex items-center border border-white/35 rounded-full overflow-hidden text-sm shrink-0">
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
                <div className="flex items-center gap-4 text-gray-200 shrink-0">
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

                  {/* Avatar */}
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

          {/* Mobile Menu Button - Visible only on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-[#4DB8B8] transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>

        {/* Mobile Menu - Visible when mobileMenuOpen is true */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 max-w-full overflow-x-hidden">
            {showAuthenticatedNavbar ? (
              <div className="space-y-3">
                {/* Mobile Search Bar */}
                <form onSubmit={handleSearch}>
                  <div className="relative w-full">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search Products"
                      className="w-full bg-transparent border border-white/30 rounded-full px-4 py-2 pr-10 text-sm text-gray-100 placeholder-gray-300 outline-none focus:border-[#4DB8B8]/60 transition-colors duration-200"
                    />
                    <button
                      type="submit"
                      aria-label="Search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 hover:text-[#4DB8B8] transition-colors duration-200"
                    >
                      <SearchIcon />
                    </button>
                  </div>
                </form>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-1 bg-white/5 rounded-lg p-2">
                  {NAV_LINKS.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={handleMobileNavClick}
                      className={`text-sm font-medium transition-colors duration-200 py-2.5 px-3 rounded ${
                        pathname === href
                          ? "text-white bg-[#4DB8B8]/30 border border-[#4DB8B8]/50"
                          : "text-gray-100 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Location Selector */}
                <div className="flex items-center border border-white/30 rounded-lg overflow-hidden text-sm">
                  <span className="px-3 py-2 text-gray-100 text-sm flex-1">
                    {city}
                  </span>
                  <button
                    onClick={() =>
                      setCity((prev) =>
                        prev === "New York" ? "Los Angeles" : "New York",
                      )
                    }
                    className="bg-[#4DB8B8] text-white text-sm font-semibold px-3 py-2 hover:bg-[#3aa3a3] transition-colors duration-200 whitespace-nowrap"
                  >
                    Change
                  </button>
                </div>

                {/* Mobile Icon Actions - Horizontal Layout */}
                <div className="bg-white/5 rounded-lg p-2 flex gap-1 overflow-x-auto">
                  <Link
                    href="/wishlist"
                    onClick={handleMobileNavClick}
                    aria-label="Wishlist"
                    className="flex flex-col items-center gap-1 hover:text-white transition-colors duration-200 py-2 px-2 rounded hover:bg-white/5 text-gray-200 flex-1 min-w-fit"
                  >
                    <HeartIcon />
                    <span className="text-xs">Wishlist</span>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={handleMobileNavClick}
                    aria-label="Cart"
                    className="flex flex-col items-center gap-1 hover:text-white transition-colors duration-200 py-2 px-2 rounded hover:bg-white/5 text-gray-200 flex-1 min-w-fit"
                  >
                    <CartIcon />
                    <span className="text-xs">Cart</span>
                  </Link>

                  <Link
                    href="/notifications"
                    onClick={handleMobileNavClick}
                    aria-label="Notifications"
                    className="flex flex-col items-center gap-1 hover:text-white transition-colors duration-200 py-2 px-2 rounded hover:bg-white/5 text-gray-200 flex-1 min-w-fit"
                  >
                    <BellIcon />
                    <span className="text-xs">Notify</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={handleMobileNavClick}
                    aria-label="Profile"
                    className="flex flex-col items-center gap-1 hover:text-white transition-colors duration-200 py-2 px-2 rounded hover:bg-white/5 text-gray-200 flex-1 min-w-fit"
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#4DB8B8]/50">
                      <Image
                        src="https://i.pravatar.cc/64?img=47"
                        alt="User Avatar"
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs">Profile</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 hover:text-red-400 transition-colors duration-200 py-2 px-3 rounded hover:bg-red-400/10 text-gray-400 border border-red-400/30 font-medium"
                >
                  <LogoutIcon />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/signup"
                  onClick={handleMobileNavClick}
                  className="rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200 text-center"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  onClick={handleMobileNavClick}
                  className="rounded-lg bg-[#4DB8B8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3aa3a3] transition-colors duration-200 text-center"
                >
                  Log in
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
