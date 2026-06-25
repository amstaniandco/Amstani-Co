"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, Package } from "lucide-react";

type OrderItem = {
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
  mainImage?: string | null;
  selectedVariants?: Record<string, string>;
  customOrderDetails?: { description: string; mediaUrls: string[] };
};

type Order = {
  _id: string;
  orderNumber?: string;
  storeName?: string;
  storeId?: string;
  createdAt?: string;
  status?: string;
  total?: number;
  subtotal?: number;
  shippingFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  notes?: string;
  isReplacement?: boolean;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  items?: OrderItem[];
  shippingAddress?: {
    fullName?: string;
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(val?: string) {
  if (!val) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(val));
}

function formatDeliveryDate(val?: string) {
  if (!val) return val;
  const d = new Date(val.includes("T") ? val : `${val}T00:00:00`);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getTotal(order: Order) {
  if (typeof order.total === "number") return order.total;
  const sub = order.subtotal ?? (order.items ?? []).reduce((s, i) => s + Number(i.price ?? 0) * Number(i.quantity ?? 1), 0);
  return sub + Number(order.shippingFee ?? 0) + Number(order.taxAmount ?? 0) - Number(order.discountAmount ?? 0);
}

function statusBadge(status?: string) {
  const s = status?.toLowerCase() ?? "";
  if (s === "delivered") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (s === "dispatched" || s === "shipped") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "cancelled" || s === "rejected") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
}

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("orderId");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(highlightId);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (highlightId && orders.length) {
      setExpanded(highlightId);
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [highlightId, orders.length]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
    [orders]
  );

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-5 w-5 text-teal-500" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Orders</h1>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm text-sm text-slate-400 dark:text-slate-500 text-center">
          Loading orders…
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm text-sm text-slate-400 dark:text-slate-500 text-center">
          No orders yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedOrders.map((order) => {
            const isHighlighted = order._id === highlightId;
            const isExpanded = expanded === order._id;
            const total = getTotal(order);

            return (
              <div
                key={order._id}
                ref={isHighlighted ? highlightRef : undefined}
                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition-all ${
                  isHighlighted ? "border-teal-400 ring-2 ring-teal-200 dark:ring-teal-800" : "border-slate-100 dark:border-slate-700"
                }`}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : order._id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {order.orderNumber || order._id}
                        {order.isReplacement && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-full">
                            REPLACEMENT
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {order.storeName} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(order.status)}`}>
                      {order.status ?? "Incoming"}
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(total)}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700 px-5 pb-5 pt-4 space-y-4">
                    {/* Items */}
                    <div className="space-y-4">
                      {(order.items ?? []).map((item, i) => {
                        const variantStr = item.selectedVariants
                          ? Object.values(item.selectedVariants).filter(Boolean).join(" / ")
                          : "";
                        const cod = item.customOrderDetails;
                        return (
                          <div key={i}>
                            <div className="flex items-center gap-3">
                              {item.mainImage && (
                                <img
                                  src={item.mainImage}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name ?? "Product"}</p>
                                {variantStr && <p className="text-xs text-slate-400 dark:text-slate-500">{variantStr}</p>}
                                {cod && (
                                  <span className="inline-block mt-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                    Custom Order
                                  </span>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(Number(item.price ?? 0))}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">× {item.quantity ?? 1}</p>
                              </div>
                            </div>
                            {/* Custom order details inline */}
                            {cod && (
                              <div className="mt-2 ml-15 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 px-3 py-2.5 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-purple-400 dark:text-purple-300">Your Custom Request</p>
                                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{cod.description}</p>
                                {cod.mediaUrls?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {cod.mediaUrls.map((url, mi) => (
                                      <button key={mi} onClick={() => setLightboxSrc(url)} className="focus:outline-none">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border border-purple-200 hover:opacity-90 transition" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Tracking info */}
                    {order.trackingNumber && (
                      <div className="rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 px-3 py-2.5 text-xs space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-teal-500">Shipment Tracking</p>
                        <p className="text-slate-700 dark:text-slate-300">
                          Tracking: <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{order.trackingNumber}</span>
                          {order.carrier && <span className="text-slate-500 dark:text-slate-400"> via {order.carrier}</span>}
                        </p>
                        {order.estimatedDelivery && (
                          <p className="text-slate-500 dark:text-slate-400">Est. delivery: <span className="font-medium text-slate-700 dark:text-slate-300">{formatDeliveryDate(order.estimatedDelivery)}</span></p>
                        )}
                      </div>
                    )}

                    {/* Shipping */}
                    {order.shippingAddress?.line1 && (
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-0.5">Shipping to</p>
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && <p className="text-xs text-slate-500 dark:text-slate-400 italic">{order.notes}</p>}

                    {/* Totals */}
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{order.paymentMethod ?? "Cash on Delivery"}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Total: {formatCurrency(total)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Link
                        href={order._id ? `/claims?orderId=${order._id}` : "/claims"}
                        className="flex-1 text-center py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold transition"
                      >
                        Open Claim for This Order
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image lightbox */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightboxSrc(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxSrc} alt="Preview" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm text-sm text-slate-400 dark:text-slate-500 text-center">
            Loading orders...
          </div>
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
