"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

type Props = {
  total: number;
  currency: string;
  onSuccess: () => void;
};

// Must be rendered inside <Elements> from @stripe/react-stripe-js.
// Renders Stripe's hosted PaymentElement (supports cards, wallets, etc.)
// and calls onSuccess when payment is confirmed.
export default function StripePaymentForm({ total, currency, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setErrorMessage(null);
    setPaying(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe may redirect here for 3DS or redirect-based payment methods.
        // We handle success in the return_url as a fallback.
        return_url: `${window.location.origin}/profile`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setPaying(false);
      return;
    }

    // Payment confirmed without redirect (card payments come here)
    onSuccess();
  }

  const displayAmount = `${currency.toUpperCase()} ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-slate-100">
          Payment Details
        </p>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-600 dark:bg-slate-900">
          <PaymentElement />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-700/40 dark:bg-rose-900/20 dark:text-rose-400">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || paying}
        className="w-full py-4 rounded-[24px] bg-[#67B3BE] text-white text-sm font-semibold tracking-wide hover:bg-[#5fa7b2] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60"
      >
        {paying ? "Processing…" : `Pay ${displayAmount}`}
      </button>

      <p className="text-center text-[11px] text-black/70 dark:text-slate-400">
        Secured by Stripe. Your card details are never stored on our servers.
      </p>
    </form>
  );
}
