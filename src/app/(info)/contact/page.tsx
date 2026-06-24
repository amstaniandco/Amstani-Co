import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Support — Amstani & Co",
  description: "Get in touch with the Amstani & Co support team.",
};

export default function ContactPage() {
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
        <p className="text-[#68B8C1] text-xs font-semibold uppercase tracking-widest mb-3">Help</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Contact Support</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
          We are committed to providing responsive customer service and support.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Customer Support</h2>
          <div className="space-y-2 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Business Hours:</span></p>
            <p>Monday – Friday: 9:00 AM – 6:00 PM (EST)</p>
            <p>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Email: </span>
              <a href="mailto:support@amstaniandco.com" className="text-[#68B8C1] hover:underline">
                support@amstaniandco.com
              </a>
            </p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Business Address:</span></p>
            <p>Oklahoma, United States.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">How We Can Help?</h2>
          <ul className="space-y-3">
            {[
              "Order inquiries",
              "Shipping and delivery support",
              "Product sourcing assistance",
              "Returns and refunds",
              "Account management",
              "Technical support",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#68B8C1] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-slate-600 dark:text-slate-400 text-[15px]">
          Our support team aims to respond to all inquiries within 3 business day.
        </p>
      </div>
    </div>
  );
}
