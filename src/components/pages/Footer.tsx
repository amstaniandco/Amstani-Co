import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import FooterTopStores from "./FooterTopStores";

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 shrink-0">
    <Image
      src="/assets/amstaniLogo.png"
      alt="Amstani & Co"
      width={28}
      height={28}
      className="h-7 w-7 object-contain"
    />
    <span className="text-white font-bold tracking-widest text-sm uppercase">
      Amstani <span className="text-gray-400 font-light">&amp; Co.</span>
    </span>
  </Link>
);

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11 9.87V15.6h-2.4V12h2.4v-2.2c0-2.38 1.42-3.7 3.58-3.7 1.04 0 2.14.18 2.14.18v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48V12h2.64l-.42 3.6h-2.22v6.26A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37a4 4 0 1 1-5.74-3.57 4 4 0 0 1 5.74 3.57Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.2v12.78a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06v-3.28a5.8 5.8 0 0 0-1.06-.1 5.86 5.86 0 1 0 5.86 5.86V8.95a7.46 7.46 0 0 0 4.36 1.4V7.13a4.28 4.28 0 0 1-3.09-1.31Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#1f1d18] text-gray-300 px-6 md:px-20 py-14">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-gray-400 mt-4 leading-6 max-w-sm">
              Here, every brand tells its own story, coming together to create a
              vibrant world of textiles waiting to be explored.
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="https://www.facebook.com/profile.php?id=61591070536391"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:border-teal-400 hover:text-teal-400 transition"
              >
                <FacebookIcon size={18} />
              </Link>
              <Link
                href="https://www.instagram.com/amstaniandco?igsh=NDFncmhubWcxanZz&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:border-teal-400 hover:text-teal-400 transition"
              >
                <InstagramIcon size={18} />
              </Link>
              <Link
                href="https://www.tiktok.com/@amstaniandco?_r=1&_t=ZS-97XiqSgdVuX"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:border-teal-400 hover:text-teal-400 transition"
              >
                <TikTokIcon size={18} />
              </Link>
            </div>
          </div>

          {/* Shop States — top ranked stores with their state */}
          <Suspense fallback={null}>
            <FooterTopStores />
          </Suspense>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Company</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/about" className="hover:text-teal-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-400 transition">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-400 transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Our Policies</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/policies/refund" className="hover:text-teal-400 transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-teal-400 transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-teal-400 transition">
                  Return &amp; Exchange
                </Link>
              </li>
              <li>
                <Link href="/policies/data-protection" className="hover:text-teal-400 transition">
                  Data Protection
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-14 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Amstani &amp; Co. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
