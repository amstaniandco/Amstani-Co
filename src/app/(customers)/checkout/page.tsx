"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { Store, Info } from "lucide-react";
import CheckoutForm from "./components/CheckoutForm";
import StripePaymentForm from "./components/StripePaymentForm";
import type { Address } from "../../../models/user";
import { useToast } from "../../../components/global/ToastProvider";
import { getSelectedState } from "../../../lib/state-preference";
import { stripePromise } from "../../../lib/stripe-client";

type CartItem = {
  productId: string;
  storeId: string;
  storeName: string;
  name: string;
  sku: string;
  price: number;
  mainImage?: string | null;
  quantity: number;
  selectedVariants?: { size?: string; color?: string };
};

type Step = "address" | "payment";

// Resolve a state string to a 2-letter code for client-side tax preview
function resolveStateCode(state: string): string {
  const s = state.trim();
  if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase();
  const paren = s.match(/\(([A-Za-z]{2})\)/);
  if (paren) return paren[1].toUpperCase();
  const NAMES: Record<string, string> = {
    alabama:"AL",alaska:"AK",arizona:"AZ",arkansas:"AR",california:"CA",colorado:"CO",
    connecticut:"CT",delaware:"DE",florida:"FL",georgia:"GA",hawaii:"HI",idaho:"ID",
    illinois:"IL",indiana:"IN",iowa:"IA",kansas:"KS",kentucky:"KY",louisiana:"LA",
    maine:"ME",maryland:"MD",massachusetts:"MA",michigan:"MI",minnesota:"MN",
    mississippi:"MS",missouri:"MO",montana:"MT",nebraska:"NE",nevada:"NV",
    "new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY",
    "north carolina":"NC","north dakota":"ND",ohio:"OH",oklahoma:"OK",oregon:"OR",
    pennsylvania:"PA","rhode island":"RI","south carolina":"SC","south dakota":"SD",
    tennessee:"TN",texas:"TX",utah:"UT",vermont:"VT",virginia:"VA",washington:"WA",
    "west virginia":"WV",wisconsin:"WI",wyoming:"WY","washington d.c.":"DC",
  };
  return NAMES[s.toLowerCase()] ?? "";
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [form, setForm] = useState({ fullName: "", phone: "", street: "", city: "", state: "", zip: "" });

  // Tax rates fetched from admin config for live preview
  const [taxRates, setTaxRates] = useState<Record<string, { name: string; rate: number }>>({});

  const [step, setStep] = useState<Step>("address");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerSessionSecret, setCustomerSessionSecret] = useState<string | null>(null);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentCurrency, setPaymentCurrency] = useState("usd");
  // Authoritative breakdown returned by the API after PaymentIntent is created
  const [serverSubtotal, setServerSubtotal] = useState<number | null>(null);
  const [serverTaxAmount, setServerTaxAmount] = useState<number | null>(null);
  const [serverDiscountAmount, setServerDiscountAmount] = useState<number | null>(null);
  const [serverTaxRate, setServerTaxRate] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCartItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setCartLoading(false));

    // Fetch tax rates for live preview
    fetch("/api/admin/pricing-rules")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.taxRates) setTaxRates(data.taxRates); })
      .catch(() => {});

    // Pre-fill state from the header's selected state
    const headerState = getSelectedState();
    if (headerState) {
      setForm((prev) => (prev.state ? prev : { ...prev, state: headerState }));
    }
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

  function handleMapAddressSelect(selection: { street?: string; city?: string; state?: string; zip?: string }) {
    setSelectedAddress("");
    setForm((prev) => ({
      ...prev,
      street: selection.street || prev.street,
      city: selection.city || prev.city,
      state: selection.state || prev.state,
      zip: selection.zip || prev.zip,
    }));
  }

  // Client-side subtotal (from raw cart prices, before server-side discount resolution)
  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // Live tax estimate (Step 1 only)
  const stateCode = resolveStateCode(form.state);
  const estimatedTaxRate = taxRates[stateCode]?.rate ?? 0;
  const estimatedTax = Math.round(cartSubtotal * estimatedTaxRate / 100 * 100) / 100;
  const estimatedTotal = cartSubtotal + estimatedTax;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
      setCustomerSessionSecret(data.customerSessionClientSecret ?? null);
      setPaymentTotal(data.total);
      setPaymentCurrency(data.currency);
      // Store authoritative breakdown for display
      setServerSubtotal(data.subtotal ?? null);
      setServerTaxAmount(data.taxAmount ?? null);
      setServerDiscountAmount(data.discountAmount ?? null);
      setServerTaxRate(data.taxRate ?? null);
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

  const storeGroups = cartItems.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.storeName || item.storeId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const stripeOptions = clientSecret
    ? {
        clientSecret,
        // Enables the PaymentElement's saved-card list + "Save this card" option.
        ...(customerSessionSecret ? { customerSessionClientSecret: customerSessionSecret } : {}),
        appearance: { theme: "stripe" as const },
      }
    : undefined;

  // For the summary panel: use authoritative server values in Step 2, estimates in Step 1
  const displaySubtotal = step === "payment" && serverSubtotal !== null ? serverSubtotal : cartSubtotal;
  const displayTax = step === "payment" && serverTaxAmount !== null ? serverTaxAmount : estimatedTax;
  const displayDiscount = step === "payment" && serverDiscountAmount !== null ? serverDiscountAmount : 0;
  const displayTotal = step === "payment" ? paymentTotal : estimatedTotal;

  return (
    <div className="min-h-screen px-2 py-4 dark:bg-slate-950">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_440px]">

        {/* Left: Address (step 1) or Payment (step 2) */}
        {step === "address" ? (
          <CheckoutForm
            savedAddresses={savedAddresses}
            selectedAddress={selectedAddress}
            onSelectAddress={applySavedAddress}
            form={form}
            onFormChange={handleChange}
            onMapAddressSelect={handleMapAddressSelect}
          />
        ) : (
          <div className="ui-panel rounded-2xl bg-white p-4 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800 sm:p-8">
            <div className="flex justify-between items-start mb-1">
              <h1 className="text-xl font-bold tracking-tight text-black dark:text-slate-100 sm:text-3xl">
                Secure Checkout
              </h1>
              <span className="mt-1 flex-shrink-0 whitespace-nowrap text-xs text-black/80 dark:text-slate-300 sm:mt-2">Step 2 of 2</span>
            </div>
            <p className="mb-4 text-sm text-black/80 dark:text-slate-300">
              Enter your card details to complete payment.
            </p>
            <div className="ui-divider mb-7 h-[3px] overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-teal-300 to-indigo-400" />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <button onClick={() => setStep("address")} className="text-xs text-teal-600 hover:underline dark:text-teal-400">
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
        <div className="ui-panel rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800 lg:sticky lg:top-10">
          <h2 className="mb-3 text-xl font-bold tracking-tight text-black dark:text-slate-100">Order Summary</h2>

          {cartLoading ? (
            <p className="text-sm text-slate-400">Loading cart…</p>
          ) : cartItems.length === 0 ? (
            <p className="text-sm text-slate-400">Your cart is empty.</p>
          ) : (
            <div className="space-y-3 text-sm text-black/80 dark:text-slate-300">
              {/* Items grouped by store — scrolls on desktop, full list on mobile */}
              <div className="space-y-2.5 lg:max-h-[44vh] lg:overflow-y-auto lg:pr-1">
                {Object.entries(storeGroups).map(([store, items]) => (
                  <div key={store} className="rounded-lg border border-gray-100 p-2.5 dark:border-slate-700">
                    {/* Prominent store name */}
                    <div className="mb-2 flex items-center gap-1.5 border-b border-gray-100 pb-1.5 dark:border-slate-700">
                      <Store className="h-3.5 w-3.5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{store}</p>
                    </div>

                    {items.map((item, idx) => {
                      const size = item.selectedVariants?.size;
                      const color = item.selectedVariants?.color;
                      return (
                        <div key={`${item.productId}-${item.storeId}-${idx}`} className="mb-2 flex items-center gap-2 last:mb-0">
                          {item.mainImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.mainImage} alt={item.name} className="h-9 w-9 flex-shrink-0 rounded-md object-cover" />
                          ) : (
                            <div className="h-9 w-9 flex-shrink-0 rounded-md bg-slate-100 dark:bg-slate-700" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {[size && `Size ${size}`, color && `Color ${color}`, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-xs font-semibold text-black dark:text-slate-100">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 border-t border-gray-100 pt-2.5 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>${displaySubtotal.toFixed(2)}</span>
                </div>

                {displayDiscount > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Discount</span>
                    <span>−${displayDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-slate-500">
                    Sales Tax
                    {serverTaxRate != null && step === "payment" && (
                      <span className="text-[11px] text-slate-400">({serverTaxRate}%)</span>
                    )}
                  </span>
                  <span>
                    {stateCode || step === "payment" ? `$${displayTax.toFixed(2)}` : "—"}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t-2 border-gray-900 pt-3 dark:border-slate-600">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-slate-100">
                  Total
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-slate-100 sm:text-2xl">
                  ${displayTotal.toFixed(2)}
                </span>
              </div>

              {/* Sales tax explainer */}
              <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Sales tax is calculated based on your shipping state{stateCode ? ` (${stateCode})` : ""} and applied
                  to the order subtotal. This is the final amount you will be charged.
                </p>
              </div>
            </div>
          )}

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
