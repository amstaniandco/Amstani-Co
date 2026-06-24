"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type AccountStatus = {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
};

export default function OwnerStripePage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-400">Loading…</div>}>
      <StripePageInner />
    </Suspense>
  );
}

function StripePageInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkAccountId, setLinkAccountId] = useState("");

  const didReturn = searchParams.get("success") === "true";
  const didRefresh = searchParams.get("refresh") === "true";

  useEffect(() => {
    fetch("/api/stripe/connect/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleConnect() {
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleOpenDashboard() {
    setActionLoading(true);
    setMessage("");
    // Open blank tab immediately on click — browsers block window.open after async calls
    const newTab = window.open("", "_blank");
    try {
      const res = await fetch("/api/stripe/connect/dashboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        newTab?.close();
        setMessage(data.error || "Could not open dashboard.");
        return;
      }
      if (newTab) {
        newTab.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    } catch {
      newTab?.close();
      setMessage("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLinkAccount() {
    if (!linkAccountId.startsWith("acct_")) {
      setMessage("Account ID must start with acct_");
      return;
    }
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/stripe/connect/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeAccountId: linkAccountId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not link account.");
        return;
      }
      setShowLinkInput(false);
      setLinkAccountId("");
      // Refresh status
      setLoading(true);
      const statusRes = await fetch("/api/stripe/connect/status");
      const statusData = await statusRes.json();
      setStatus(statusData);
      setLoading(false);
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Stripe Payouts</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Connect your Stripe account so Amstani can send your 80% share of every sale directly to your bank.
        </p>

        {didReturn && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:text-emerald-400">
            Onboarding complete! Your Stripe account status is shown below.
          </div>
        )}

        {didRefresh && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-400">
            Your onboarding session expired. Click the button below to continue.
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-600 dark:border-rose-700/40 dark:bg-rose-900/20 dark:text-rose-400">
            {message}
          </div>
        )}

        <div data-tutorial-id="owner-payouts-section" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-5">
          {loading ? (
            <p className="text-sm text-slate-400">Checking your Stripe account…</p>
          ) : (
            <>
              <div className="space-y-3">
                <StatusRow
                  label="Stripe account connected"
                  ok={status?.connected ?? false}
                  okText="Connected"
                  failText="Not connected"
                />
                <StatusRow
                  label="Onboarding complete"
                  ok={status?.detailsSubmitted ?? false}
                  okText="Submitted"
                  failText="Incomplete"
                />
                <StatusRow
                  label="Can accept payments"
                  ok={status?.chargesEnabled ?? false}
                  okText="Enabled"
                  failText="Pending Stripe review"
                />
                <StatusRow
                  label="Payouts to bank"
                  ok={status?.payoutsEnabled ?? false}
                  okText="Enabled"
                  failText="Not yet enabled"
                />
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-700" />

              {!status?.connected || !status?.detailsSubmitted ? (
                <div>
                  <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                    {!status?.connected
                      ? "You have not connected a Stripe account yet. Click below to begin the quick verification process."
                      : "Your onboarding is not complete. Click below to finish setting up your account."}
                  </p>
                  <button
                    onClick={handleConnect}
                    disabled={actionLoading}
                    className="w-full rounded-xl bg-[#635BFF] py-3 text-sm font-semibold text-white transition hover:bg-[#5851e8] disabled:opacity-60"
                  >
                    {actionLoading ? "Redirecting to Stripe…" : "Connect with Stripe"}
                  </button>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowLinkInput((v) => !v)}
                      className="text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      Already have an existing Stripe account ID?
                    </button>
                    {showLinkInput && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-slate-500">
                          Paste your account ID from Stripe Dashboard → Connect → Accounts (starts with <span className="font-mono">acct_</span>)
                        </p>
                        <input
                          type="text"
                          value={linkAccountId}
                          onChange={(e) => setLinkAccountId(e.target.value)}
                          placeholder="acct_xxxxxxxxxxxxxxxx"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-800 outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        />
                        <button
                          onClick={handleLinkAccount}
                          disabled={actionLoading || !linkAccountId.startsWith("acct_")}
                          className="w-full rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
                        >
                          {actionLoading ? "Linking…" : "Link This Account"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                    Your Stripe account is active. View your payouts, balance, and transaction history in the Stripe Express dashboard.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleOpenDashboard}
                      disabled={actionLoading}
                      className="flex-1 rounded-xl bg-[#635BFF] py-3 text-sm font-semibold text-white transition hover:bg-[#5851e8] disabled:opacity-60"
                    >
                      {actionLoading ? "Opening…" : "Open Stripe Dashboard"}
                    </button>
                    <button
                      onClick={handleConnect}
                      disabled={actionLoading}
                      className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                    >
                      Update Account Info
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Important</p>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li>Amstani & Co will only charge $15 per month maintainance charges from each store</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, ok, okText, failText }: { label: string; ok: boolean; okText: string; failText: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <span
        className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
          ok
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
        }`}
      >
        {ok ? okText : failText}
      </span>
    </div>
  );
}
