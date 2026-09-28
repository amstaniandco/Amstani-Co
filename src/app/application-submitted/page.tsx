import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Application Submitted — Amstani & Co",
  description: "Your Amstani & Co store-owner application has been received.",
};

export default function ApplicationSubmittedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f8f8] px-5 py-12 text-slate-900 dark:bg-[#07191d] dark:text-slate-100">
      <section className="w-full max-w-2xl rounded-3xl border border-[#d3e3e3] bg-white p-8 text-center shadow-[0_20px_50px_rgba(13,48,53,0.1)] dark:border-[#28565b] dark:bg-[#0e292e] sm:p-12">
        <CheckCircle2 className="mx-auto h-16 w-16 text-[#2f9fa5]" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#2f9fa5]">Application received</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Thank You for Applying!</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">We have successfully received your Amstani &amp; Co store-owner application. Our team will review your information and contact you using your preferred contact method if we need more details or are ready to discuss next steps.</p>
        <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-slate-500 dark:text-slate-400">Submission does not guarantee acceptance, store approval, or a specific business outcome.</p>
        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-[#edf7f6] p-6 text-left dark:bg-[#14383d]">
          <h2 className="font-bold">What happens next?</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li><strong>1.</strong> Our team reviews your application.</li>
            <li><strong>2.</strong> We may contact you for clarification or additional information.</li>
            <li><strong>3.</strong> We explain applicable terms, costs, ordering, and responsibilities before any commitment or payment.</li>
          </ol>
        </div>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2f9fa5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#267f8c]"><ArrowLeft size={16} /> Return to Amstani &amp; Co</Link>
      </section>
    </main>
  );
}
