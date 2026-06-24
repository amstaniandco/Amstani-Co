import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Amstani & Co",
  description: "Learn about Amstani & Co, a multi-brand textile marketplace connecting businesses and customers across America.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400"
      >
        <ArrowLeft size={16} />
        <span>Back to home</span>
      </Link>

      <div className="mb-10 pb-8 border-b border-slate-200 dark:border-slate-700">
        <p className="text-[#68B8C1] text-xs font-semibold uppercase tracking-widest mb-3">Company</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">About Us</h1>
      </div>

      <div className="space-y-5 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
        <p>
          Welcome to Amstani &amp; Co, a multi-brand textile marketplace offering high-quality fabrics and textile products from trusted brands on irresistible prices for people all across America.
        </p>
        <p>
          We are committed to quality, transparency, competitive pricing, and reliable service, helping businesses and fashion entrepreneurs join our platform and sell with confidence.
        </p>
        <p>
          Whether you are a fashion brand, wholesaler, retailer, or manufacturer, our platform connects you with a broad audience across the United States, creating valuable opportunities to grow your business and increase sales.
        </p>
        <p>
          Our mission is to make textile sourcing and selling simple, reliable, and scalable for businesses and customers all across the United States and beyond.
        </p>
      </div>
    </div>
  );
}
