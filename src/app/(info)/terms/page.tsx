import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Amstani & Co",
  description: "Read the Terms & Conditions for using the Amstani & Co platform.",
};

export default function TermsPage() {
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
        <p className="text-[#68B8C1] text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Terms &amp; Conditions</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
          By accessing and using our platform, you agree to comply with these Terms &amp; Conditions.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Use of Services</h2>
          <ul className="space-y-3">
            {[
              "Users must provide accurate and complete registration information.",
              "You are responsible for maintaining the confidentiality of your account credentials.",
              "Unauthorized use of the platform is strictly prohibited.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Orders and Payments</h2>
          <ul className="space-y-3">
            {[
              "All orders are subject to product availability and acceptance.",
              "Prices are displayed in U.S. Dollars (USD) unless otherwise specified.",
              "Payment must be completed before order processing and shipment.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Product Information</h2>
          <ul className="space-y-3">
            {[
              "We strive to ensure product descriptions, specifications, and images are accurate.",
              "Minor variations in color, texture, or appearance may occur due to manufacturing processes and display settings.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Intellectual Property</h2>
          <ul className="space-y-3">
            <li className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
              All website content, including logos, graphics, text, and software, is the property of the company and may not be used without permission.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Limitation of Liability</h2>
          <ul className="space-y-3">
            <li className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
              We shall not be liable for indirect, incidental, or consequential damages arising from the use of our platform or products.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Modifications</h2>
          <ul className="space-y-3">
            <li className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
              We reserve the right to update these Terms &amp; Conditions at any time. Continued use of the platform constitutes acceptance of the revised terms.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
