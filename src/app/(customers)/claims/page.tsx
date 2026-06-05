"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClaimItemSelector from "./components/ClaimItemSelector";
import ClaimForm from "./components/ClaimForm";
import ClaimsTable from "./components/ClaimsTable";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  mainImage?: string | null;
  quantity: number;
  selectedVariants?: Record<string, string>;
};

type Order = {
  _id: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
};

type FlatProduct = {
  id: string;      // `${productId}__${orderId}`
  orderId: string;
  storeId: string;
  image: string;
  store: string;
  name: string;
  variant: string;
  price: number;
  maxQty: number;
};

type Claim = {
  _id?: string;
  claimNumber: string;
  customerName: string;
  reason: string;
  status: "open" | "owner_responded" | "resolved" | "admin_escalated" | "awaiting_reorder";
  storeId?: string;
};

function ClaimPageContent() {
  const searchParams = useSearchParams();
  const targetOrderId = searchParams.get("orderId");

  const [allProducts, setAllProducts] = useState<FlatProduct[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, claimsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/claims"),
        ]);

        if (ordersRes.ok) {
          const { orders }: { orders: Order[] } = await ordersRes.json();
          const flat: FlatProduct[] = [];
          const seen = new Set<string>();
          for (const order of orders) {
            for (const item of order.items) {
              const key = `${item.productId}-${order._id}`;
              if (seen.has(key)) continue;
              seen.add(key);
              const variantStr = item.selectedVariants
                ? Object.values(item.selectedVariants).join(" / ")
                : "";
              flat.push({
                id: `${item.productId}__${order._id}`,
                orderId: order._id,
                storeId: order.storeId,
                image: item.mainImage || "",
                store: order.storeName,
                name: item.name || "Product",
                variant: variantStr,
                price: item.price,
                maxQty: item.quantity,
              });
            }
          }
          setAllProducts(flat);
          setQuantities(Object.fromEntries(flat.map((p) => [p.id, 1])));
        }

        if (claimsRes.ok) {
          const { claims: fetched } = await claimsRes.json();
          setClaims(fetched || []);
        }
      } finally {
        setLoadingOrders(false);
      }
    }
    load();
  }, []);

  // When coming from "Open Claim" on a specific order, show only that order's items
  const products = useMemo(
    () =>
      targetOrderId
        ? allProducts.filter((p) => p.orderId === targetOrderId)
        : allProducts,
    [allProducts, targetOrderId]
  );

  const handleQty = (id: string, delta: number) => {
    const product = allProducts.find((p) => p.id === id);
    const max = product?.maxQty ?? 99;
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(max, Math.max(1, (prev[id] ?? 1) + delta)),
    }));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    const allSelected = products.every((p) => selected[p.id]);
    if (allSelected) {
      setSelected({});
    } else {
      setSelected(Object.fromEntries(products.map((p) => [p.id, true])));
    }
  };

  const handleSubmitClaim = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    const selectedItems = products.filter((p) => selected[p.id]);
    if (!selectedItems.length) {
      setSubmitError("Please select at least one item to dispute.");
      return;
    }
    if (!issueType) {
      setSubmitError("Please select an issue type.");
      return;
    }
    if (!message.trim()) {
      setSubmitError("Please describe the issue.");
      return;
    }

    // Group by orderId — one claim per order
    const byOrder = new Map<string, FlatProduct[]>();
    for (const item of selectedItems) {
      if (!byOrder.has(item.orderId)) byOrder.set(item.orderId, []);
      byOrder.get(item.orderId)!.push(item);
    }

    setSubmitting(true);
    try {
      for (const [orderId, orderItems] of byOrder) {
        const claimItems = orderItems.map((p) => ({
          productId: p.id.split("__")[0],
          name: p.name,
          image: p.image || null,
          price: p.price,
          quantity: quantities[p.id] ?? 1,
          variant: p.variant || undefined,
        }));

        const res = await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            items: claimItems,
            reason: issueType,
            description: message.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error || "Failed to submit claim.");
          return;
        }
      }

      setSubmitSuccess("Claim submitted. The store owner has been notified.");
      setSelected({});
      setIssueType("");
      setMessage("");

      const claimsRes = await fetch("/api/claims");
      if (claimsRes.ok) {
        const { claims: refreshed } = await claimsRes.json();
        setClaims(refreshed || []);
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5 text-base">
      {targetOrderId && (
        <div className="w-full bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-teal-700 font-medium">
          Showing items from your selected order. Only these items can be included in this claim.
        </div>
      )}

      {loadingOrders ? (
        <div className="bg-white rounded-2xl p-6 w-full shadow-sm text-center text-sm text-gray-400">
          Loading your orders…
        </div>
      ) : (
        <ClaimItemSelector
          products={products}
          quantities={quantities}
          selected={selected}
          handleQty={handleQty}
          toggleSelect={toggleSelect}
          onSelectAll={handleSelectAll}
        />
      )}

      <ClaimForm
        issueType={issueType}
        message={message}
        setIssueType={setIssueType}
        setMessage={setMessage}
        onSubmit={handleSubmitClaim}
        submitting={submitting}
        error={submitError}
        success={submitSuccess}
      />

      <ClaimsTable claims={claims} />
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5 text-base">
          <div className="bg-white rounded-2xl p-6 w-full shadow-sm text-center text-sm text-gray-400">
            Loading your claims...
          </div>
        </div>
      }
    >
      <ClaimPageContent />
    </Suspense>
  );
}
