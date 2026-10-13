"use client";

import Link from "next/link";

export default function AuthRequiredModal({ onClose }: { onClose: () => void }) {
  const next = typeof window === "undefined" ? "/checkout" : `${window.location.pathname}${window.location.search}`;
  const query = `?next=${encodeURIComponent(next)}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="auth-required-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-required-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in to continue</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">An account is required to complete checkout. Your cart and wishlist will stay saved.</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400" aria-label="Close">×</button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href={`/login${query}`} className="rounded-xl bg-[#56aebb] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#489fad]">Log in</Link>
          <Link href={`/signup${query}`} className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Create account</Link>
        </div>
      </div>
    </div>
  );
}