import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Application Submitted — Amstani & Co",
  description: "Your Amstani & Co store-owner application has been received.",
};

export default function ApplicationSubmittedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f8f8] px-4 py-6 text-slate-900 dark:bg-[#07191d] dark:text-slate-100 sm:px-5 sm:py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-[#d3e3e3] bg-white p-5 text-center shadow-[0_20px_50px_rgba(13,48,53,0.1)] dark:border-[#28565b] dark:bg-[#0e292e] sm:p-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#2f9fa5] sm:h-16 sm:w-16" />

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#2f9fa5] sm:mt-6">
          Application received
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:mt-3 sm:text-5xl">
          Thank You for Applying!
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-justify text-sm leading-6 text-slate-600 dark:text-slate-300 sm:mt-5 sm:text-left sm:leading-7">
          We have successfully received your Amstani &amp; Co store-owner
          application. Our team will review your information and contact you
          using your preferred contact method if we need more details or are
          ready to discuss next steps.
        </p>

        <p className="mx-auto mt-3 max-w-xl text-justify text-xs leading-5 text-slate-500 dark:text-slate-400 sm:mt-4 sm:text-left sm:leading-6">
          Submission does not guarantee acceptance, store approval, or a
          specific business outcome.
        </p>

        <div className="mx-auto mt-6 max-w-lg rounded-2xl bg-[#edf7f6] p-4 text-left dark:bg-[#14383d] sm:mt-10 sm:p-6">
          <h2 className="text-center font-bold sm:text-left">
            What happens next?
          </h2>

          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:mt-4 sm:space-y-3">
            <li className="pl-1">Our team reviews your application.</li>

            <li className="pl-1">
              We may contact you for clarification or additional information.
            </li>

            <li className="pl-1">
              We explain applicable terms, costs, ordering, and responsibilities
              before any commitment or payment.
            </li>
          </ol>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2f9fa5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#267f8c] sm:mt-8 sm:px-6 sm:py-3"
        >
          <ArrowLeft size={16} />
          Return to Amstani &amp; Co
        </Link>
      </section>
    </main>
  );
}
