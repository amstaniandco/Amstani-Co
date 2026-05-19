"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CheckoutForm from "./components/CheckoutForm";
import type { Address } from "../../../models/user";

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

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", phone: "", street: "", city: "", state: "", zip: "" });

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCartItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setCartLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const addresses: Address[] = data?.user?.addresses ?? [];
        const shippingAddresses = addresses.filter((address) => address.type !== "billing");
        setSavedAddresses(shippingAddresses);
        if (data?.user?.phone) {
          setForm((prev) => ({ ...prev, phone: prev.phone || data.user.phone }));
        }

        const defaultAddress = shippingAddresses.find((address) => address.isDefault) ?? shippingAddresses[0];
        if (defaultAddress) {
          applySavedAddress(defaultAddress);
        }
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

  async function handlePlaceOrder() {
    setError("");
    if (!form.fullName || !form.street || !form.city || !form.state) {
      setError("Please fill in your full name, street, city, and state.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
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
      if (!res.ok) { setError(data.error || "Failed to place order"); return; }
      router.push("/profile");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  // Group cart by store for summary
  const storeGroups = cartItems.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.storeName || item.storeId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-2 py-4 dark:bg-slate-950">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_380px]">
        <CheckoutForm
          savedAddresses={savedAddresses}
          selectedAddress={selectedAddress}
          onSelectAddress={applySavedAddress}
          form={form}
          onFormChange={handleChange}
        />

        {/* Order Summary */}
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
                    <div key={item.productId} className="flex justify-between mb-1">
                      <span className="truncate max-w-[200px]">{item.name} ×{item.quantity}</span>
                      <span className="font-medium text-black dark:text-slate-100">
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="h-px bg-gray-100 dark:bg-slate-700 mt-2" />
                </div>
              ))}

              <div className="flex items-center justify-between border-t-2 border-gray-900 pt-4 dark:border-slate-600">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-slate-100">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Rs {subtotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing || cartItems.length === 0}
            className="mt-5 w-full py-4 rounded-[24px] bg-[#67B3BE] text-white text-sm font-semibold tracking-wide hover:bg-[#5fa7b2] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60"
          >
            {placing ? "Placing Order…" : "Place Order"}
          </button>

          <p className="mt-3 text-center text-[11px] text-black/70 dark:text-slate-400">
            Secure payment processed via Amstani Global Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
