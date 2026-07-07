"use client";

import { useEffect, useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../../../lib/stripe-client";
import { useToast } from "../../../../components/global/ToastProvider";

type Props = {
  onAdded: () => Promise<void> | void;
  onCancel: () => void;
};

// Inner form — must live inside <Elements>. Collects a card via Stripe and
// saves it to the customer with a SetupIntent (no charge).
function SetupForm({ onAdded, onCancel }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSaving(true);
    setErrorMessage(null);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: `${window.location.origin}/profile` },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Could not save card. Please try again.");
      setSaving(false);
      return;
    }

    // Mark the new card redisplayable so it also appears at checkout.
    const paymentMethodId =
      typeof setupIntent?.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent?.payment_method?.id;
    if (paymentMethodId) {
      await fetch("/api/user/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      }).catch(() => {});
    }

    toast.success("Card added successfully!");
    await onAdded();
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-700/40 dark:bg-rose-900/20 dark:text-rose-400">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !stripe || !elements}
          className="rounded-lg bg-[#4DB8B8] px-4 py-2 font-semibold text-white hover:bg-[#3aa3a3] transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Card"}
        </button>
      </div>
    </form>
  );
}

// Wrapper — fetches the SetupIntent client secret then mounts <Elements>.
export default function AddCardForm({ onAdded, onCancel }: Props) {
  const toast = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/user/cards/setup-intent", { method: "POST" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (active) setClientSecret(data.clientSecret);
      })
      .catch(() => {
        if (active) toast.error("Could not start card setup. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [toast]);

  if (loading) {
    return <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">Loading secure form…</p>;
  }

  if (!clientSecret) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-rose-500">Could not load the payment form.</p>
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <SetupForm onAdded={onAdded} onCancel={onCancel} />
    </Elements>
  );
}
