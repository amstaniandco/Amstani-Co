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
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(val));
}

function getTotal(order: Order) {
  if (typeof order.total === "number") return order.total;
  const sub = order.subtotal ?? (order.items ?? []).reduce((s, i) => s + Number(i.price ?? 0) * Number(i.quantity ?? 1), 0);
  return sub + Number(order.shippingFee ?? 0) + Number(order.taxAmount ?? 0) - Number(order.discountAmount ?? 0);
}

function statusBadge(status?: string) {
  const s = status?.toLowerCase() ?? "";
  if (s === "delivered") return "bg-emerald-100 text-emerald-700";
  if (s === "dispatched" || s === "shipped") return "bg-blue-100 text-blue-700";
  if (s === "cancelled" || s === "rejected") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("orderId");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(highlightId);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Auto-expand and scroll to the highlighted order once loaded
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
        <h1 className="text-xl font-bold text-slate-900">My Orders</h1>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-slate-400 text-center">
          Loading orders…
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-slate-400 text-center">
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
                className={`bg-white rounded-2xl shadow-sm border transition-all ${
                  isHighlighted
                    ? "border-teal-400 ring-2 ring-teal-200"
                    : "border-slate-100"
                }`}
              >
                {/* Row header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : order._id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {order.orderNumber || order._id}
                        {order.isReplacement && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                            REPLACEMENT
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.storeName} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(order.status)}`}>
                      {order.status ?? "Incoming"}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(total)}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
                    {/* Items */}
                    <div className="space-y-3">
                      {(order.items ?? []).map((item, i) => {
                        const variantStr = item.selectedVariants
                          ? Object.values(item.selectedVariants).filter(Boolean).join(" / ")
                          : "";
                        return (
                          <div key={i} className="flex items-center gap-3">
                            {item.mainImage && (
                              <img
                                src={item.mainImage}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{item.name ?? "Product"}</p>
                              {variantStr && <p className="text-xs text-slate-400">{variantStr}</p>}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-slate-800">{formatCurrency(Number(item.price ?? 0))}</p>
                              <p className="text-xs text-slate-400">× {item.quantity ?? 1}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shipping */}
                    {order.shippingAddress?.line1 && (
                      <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                        <p className="font-semibold text-slate-700 mb-0.5">Shipping to</p>
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <p className="text-xs text-slate-500 italic">{order.notes}</p>
                    )}

                    {/* Totals */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-500">{order.paymentMethod ?? "Cash on Delivery"}</span>
                      <span className="text-sm font-bold text-slate-900">Total: {formatCurrency(total)}</span>
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
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-slate-400 text-center">
            Loading orders...
          </div>
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
