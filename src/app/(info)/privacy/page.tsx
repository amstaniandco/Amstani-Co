import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Amstani & Co",
  description: "Learn how Amstani & Co collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Privacy Policy</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Information We Collect</h2>
          <ul className="space-y-3">
            {[
              "Name, email address, phone number, and business details.",
              "Billing and shipping information.",
              "Transaction and order history.",
              "Website usage and analytics data.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">How We Use Information</h2>
          <ul className="space-y-3">
            {[
              "Process and fulfill orders.",
              "Provide customer support.",
              "Improve platform functionality and user experience.",
              "Communicate updates, promotions, and service notifications.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Information Sharing</h2>
          <ul className="space-y-3">
            {[
              "We do not sell personal information.",
              "Information may be shared with logistics providers, payment processors, and service partners solely for business operations.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Data Security</h2>
          <p className="text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
            We implement industry-standard security measures to protect customer information from unauthorized access, disclosure, or misuse.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Contact Support</h2>
          <p className="text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
            We are committed to providing responsive customer service and support.
          </p>
        </section>
      </div>
    </div>
  );
}
