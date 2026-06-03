"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./components/CheckoutForm";
import StripePaymentForm from "./components/StripePaymentForm";
import type { Address } from "../../../models/user";
import { useToast } from "../../../components/global/ToastProvider";

// Stripe publishable key — safe to expose on the client
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type CartItem = {
  productId: string;
  storeId: string;
  storeName: string;
  name: string;
  sku: string;
  price: number;
  mainImage?: string | null;
  quantity: number;
};

// Step 1 — customer fills in shipping address
// Step 2 — Stripe payment form (after PaymentIntent is created server-side)
type Step = "address" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [form, setForm] = useState({ fullName: "", phone: "", street: "", city: "", state: "", zip: "" });

  const [step, setStep] = useState<Step>("address");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentCurrency, setPaymentCurrency] = useState("usd");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCartItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setCartLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const addresses: Address[] = data?.user?.addresses ?? [];
        const shipping = addresses.filter((a) => a.type !== "billing");
        setSavedAddresses(shipping);
        if (data?.user?.phone) setForm((prev) => ({ ...prev, phone: prev.phone || data.user.phone }));
        const def = shipping.find((a) => a.isDefault) ?? shipping[0];
        if (def) applySavedAddress(def);
      })
      .catch(() => {});
  }, []);

  function applySavedAddress(address: Address) {
    setSelectedAddress(address.id);
    setForm((prev) => ({
      ...prev,
      fullName: address.recipientName,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
    }));
  }

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1 → Step 2: create PaymentIntent + orders on server, then show card form
  async function handleContinueToPayment() {
    if (!form.fullName || !form.street || !form.city || !form.state) {
      toast.error("Please fill in your full name, street, city, and state.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: form.fullName,
            line1: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: "PK",
            phone: form.phone,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not start checkout. Please try again.");
        return;
      }
      setClientSecret(data.clientSecret);
      setPaymentTotal(data.total);
      setPaymentCurrency(data.currency);
      setStep("payment");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePaymentSuccess() {
    toast.success("Payment successful! Your orders are confirmed.");
    router.push("/profile");
  }

  // Group items by store for the order summary panel
  const storeGroups = cartItems.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.storeName || item.storeId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const stripeOptions = clientSecret
    ? { clientSecret, appearance: { theme: "stripe" as const } }
    : undefined;

  return (
    <div className="min-h-screen px-2 py-4 dark:bg-slate-950">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_380px]">

        {/* Left: Address (step 1) or Payment (step 2) */}
        {step === "address" ? (
          <CheckoutForm
            savedAddresses={savedAddresses}
            selectedAddress={selectedAddress}
            onSelectAddress={applySavedAddress}
            form={form}
            onFormChange={handleChange}
          />
        ) : (
          <div className="ui-panel rounded-2xl bg-white p-8 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
            <div className="flex justify-between items-start mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-black dark:text-slate-100">
                Secure Checkout
              </h1>
              <span className="mt-2 text-xs text-black/80 dark:text-slate-300">Step 2 of 2</span>
            </div>
            <p className="mb-4 text-sm text-black/80 dark:text-slate-300">
              Enter your card details to complete payment.
            </p>
            <div className="ui-divider mb-7 h-[3px] overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-teal-300 to-indigo-400" />
            </div>

            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => setStep("address")}
                className="text-xs text-teal-600 hover:underline dark:text-teal-400"
              >
                ← Back to address
              </button>
            </div>

            {clientSecret && stripeOptions && (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <StripePaymentForm
                  total={paymentTotal}
                  currency={paymentCurrency}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}
          </div>
        )}

        {/* Right: Order Summary (always visible) */}
        <div className="ui-panel rounded-2xl bg-white p-7 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800 lg:sticky lg:top-10">
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-black dark:text-slate-100">Order Summary</h2>

          {cartLoading ? (
            <p className="text-sm text-slate-400">Loading cart…</p>
          ) : cartItems.length === 0 ? (
            <p className="text-sm text-slate-400">Your cart is empty.</p>
          ) : (
            <div className="space-y-4 text-sm text-black/80 dark:text-slate-300">
              {Object.entries(storeGroups).map(([store, items]) => (
                <div key={store}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">{store}</p>
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.storeId}-${item.sku}`} className="flex justify-between mb-1">
                      <span className="truncate max-w-[200px]">{item.name} ×{item.quantity}</span>
                      <span className="font-medium text-black dark:text-slate-100">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="h-px bg-gray-100 dark:bg-slate-700 mt-2" />
                </div>
              ))}

              <div className="flex items-center justify-between border-t-2 border-gray-900 pt-4 dark:border-slate-600">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-slate-100">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Step 1: Continue to Payment button */}
          {step === "address" && (
            <>
              <button
                onClick={handleContinueToPayment}
                disabled={submitting || cartItems.length === 0}
                className="mt-5 w-full py-4 rounded-[24px] bg-[#67B3BE] text-white text-sm font-semibold tracking-wide hover:bg-[#5fa7b2] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60"
              >
                {submitting ? "Preparing payment…" : "Continue to Payment →"}
              </button>
              <p className="mt-3 text-center text-[11px] text-black/70 dark:text-slate-400">
                Secured by Stripe
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
