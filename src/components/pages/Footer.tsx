// app/components/Footer/page.tsx
import Link from "next/link";

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

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.35 2.35 0 1 0 0 4.7 2.35 2.35 0 0 0 0-4.7Zm.02 21.5H2V8h3v17Zm7.78 0h-3V8h3v17Zm5.5-4.9a2.18 2.18 0 0 1-2.4 2.05 2.33 2.33 0 0 1-1.86-.84v.84h-3V8h3v3c.4-.56 1.1-1.2 2.3-1.2 2.85 0 3.5 1.8 3.5 4.1v7.6Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#1f1d18] text-gray-300 px-6 md:px-20 py-14">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Left */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>

            <p className="text-sm text-gray-400 mt-4 leading-6 max-w-sm">
              Here, every brand tells its own story, coming together to create a
              vibrant world of textiles waiting to be explored.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <Link
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:border-teal-400 hover:text-teal-400 transition"
              >
                <FacebookIcon size={18} />
              </Link>

              <Link
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:border-teal-400 hover:text-teal-400 transition"
              >
                <InstagramIcon size={18} />
              </Link>

              <Link
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 hover:border-teal-400 hover:text-teal-400 transition"
              >
                <LinkedinIcon size={18} />
              </Link>
            </div>
          </div>

          {/* Middle */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">
              Shop States
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  California Boutique
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  New York Atelier
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Texas Heritage
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Florida Tropics
                </Link>
              </li>
            </ul>
          </div>

          {/* Right */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Company</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Policies */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Our Policies</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Return & Exchange
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Data Protection
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-14 pt-6 text-center text-sm text-gray-500">
          © 2024 Amstani & Co. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
