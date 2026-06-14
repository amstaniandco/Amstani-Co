"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  List,
  Search,
  Store,
  Square,
} from "lucide-react";
import {
  getStatusTone,
  mapOrderToRow,
  ownerStatusOptions,
  type OrderRow,
  type OrderStatus,
  statusStyles,
} from "./data";

const filters = ["All", "Incoming", "Accepted", "Rejected", "On Hold", "Dispatched", "Shipped", "Delivered"];
const PAGE_SIZE = 10;

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-400">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p as number)}
            className={`min-w-[32px] rounded-lg border px-2 py-2 text-xs font-semibold transition ${
              p === page
                ? "border-[#65bbc5] bg-[#65bbc5] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex min-w-[260px] max-w-[320px] items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-slate-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
      <Search className="h-4 w-4 shrink-0" />
      <span className="sr-only">Search orders</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Order ID, Customer Name."
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

function FilterPills({ active, onFilter }: { active: string; onFilter: (f: string) => void }) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onFilter(filter)}
          className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            active === filter ? "bg-[#65bbc5] text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

function OrdersTable({
  orders,
  selectedOrderId,
  onSelectOrder,
}: {
  orders: OrderRow[];
  selectedOrderId: string;
  onSelectOrder: (orderId: string) => void;
}) {
  if (!orders.length) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
        No orders match your current view.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-slate-50">
            <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <th className="px-5 py-4">Order ID</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={`cursor-pointer text-sm text-slate-700 transition ${
                  order.id === selectedOrderId ? "bg-cyan-50/60" : "hover:bg-slate-50"
                }`}
              >
                <td className="whitespace-nowrap px-5 py-5 font-semibold text-slate-900">{order.id}</td>
                <td className="px-5 py-5">
                  <div className="font-medium text-slate-900">{order.customer}</div>
                  <div className="text-xs text-slate-400">{order.email}</div>
                </td>
                <td className="whitespace-nowrap px-5 py-5 text-slate-500">{order.date}</td>
                <td className="whitespace-nowrap px-5 py-5 text-base font-semibold text-slate-900">{order.total}</td>
                <td className="px-5 py-5">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.statusTone]}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type ShippingEdit = { trackingNumber: string; carrier: string; shippingMethod: string; estimatedDelivery: string };

function toDateInputValue(str: string): string {
  if (!str || str === "-") return "";
  const d = new Date(str);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDeliveryDisplay(str: string): string {
  if (!str || str === "-") return str;
  const d = new Date(str.includes("T") ? str : `${str}T00:00:00`);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("My Store");
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [shippingEdit, setShippingEdit] = useState<ShippingEdit | null>(null);
  const [shippingSaving, setShippingSaving] = useState(false);

  const fetchOrders = useCallback(() => {
    fetch("/api/owner/orders")
      .then((r) => r.json())
      .then((data) => {
        if (!data.orders) throw new Error(data.error || "Failed to load orders");
        const mapped = (data.orders ?? []).map(mapOrderToRow);
        setOrders(mapped);
        setStoreName(data.storeName ?? "My Store");

        const params = new URLSearchParams(window.location.search);
        const targetMongoId = params.get("orderId");
        if (targetMongoId) {
          const match = mapped.find((o: OrderRow) => o._mongoId === targetMongoId);
          if (match) {
            setSelectedOrderId(match.id);
            setActiveFilter("All");
            setQuery("");
            const idx = mapped.findIndex((o: OrderRow) => o._mongoId === targetMongoId);
            if (idx >= 0) setPage(Math.floor(idx / PAGE_SIZE) + 1);
            return;
          }
        }
        setSelectedOrderId((current) => current || mapped[0]?.id || "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    localStorage.setItem("sb_seen_owner_orders", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("sb-seen", { detail: "owner_orders" }));
  }, []);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = activeFilter === "All" || order.status === activeFilter;
      const matchesQuery =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.email.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, orders, query]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  // Reset to page 1 when filter or search changes
  useEffect(() => { setPage(1); }, [activeFilter, query]);

  const visibleOrders = useMemo(
    () => filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredOrders, page],
  );

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0],
    [orders, selectedOrderId],
  );

  const itemsSubtotal = selectedOrder?.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ?? 0;
  const grandTotal =
    itemsSubtotal +
    (selectedOrder?.shippingFee ?? 0) +
    (selectedOrder?.taxAmount ?? 0) -
    (selectedOrder?.discountAmount ?? 0);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    setOrders((prev) =>
      prev.map((item) => (item.id === orderId ? { ...item, status: nextStatus, statusTone: getStatusTone(nextStatus) } : item)),
    );

    const response = await fetch("/api/owner/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order._mongoId ?? orderId, status: nextStatus }),
    });

    if (!response.ok) {
      setOrders((prev) => prev.map((item) => (item.id === orderId ? order : item)));
    }
  };

  const saveShipping = async () => {
    if (!selectedOrder || !shippingEdit) return;
    setShippingSaving(true);
    try {
      const res = await fetch("/api/owner/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder._mongoId ?? selectedOrder.id,
          shipping: shippingEdit,
        }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  trackingNumber: shippingEdit.trackingNumber || "-",
                  carrier: shippingEdit.carrier || "-",
                  shippingMethod: shippingEdit.shippingMethod || "Standard",
                  estimatedDelivery: shippingEdit.estimatedDelivery || "-",
                }
              : o
          )
        );
        setShippingEdit(null);
      }
    } finally {
      setShippingSaving(false);
    }
  };

  // Reset shipping edit form when a different order is selected
  useEffect(() => {
    setShippingEdit(null);
  }, [selectedOrderId]);

  return (
    <>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-900">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">{storeName}</h1>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:self-auto sm:px-6"
        >
          <Square className="h-4 w-4" />
          Go Live
        </button>
      </section>

      <section className="mt-4 rounded-[32px] bg-white px-4 py-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[2.1rem]">Order Management</h2>
            <p className="mt-1 text-sm text-slate-500">Manage and track your high-end franchise store orders.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/orders/all"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <List className="h-4 w-4" />
              Show All
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        <div data-tutorial-id="owner-orders-filters" className="mt-5 flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="shrink-0">
            <SearchField value={query} onChange={setQuery} />
          </div>
          <FilterPills active={activeFilter} onFilter={setActiveFilter} />
        </div>
      </section>

      <section data-tutorial-id="owner-orders-list" className="mt-4 space-y-4">
        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">Loading orders...</div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-100 bg-white p-12 text-center text-sm text-red-500">{error}</div>
        ) : (
          <>
            <OrdersTable orders={visibleOrders} selectedOrderId={selectedOrderId} onSelectOrder={setSelectedOrderId} />
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}

        {selectedOrder && (
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)] overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Summary</p>
                <h3 className="mt-0.5 text-lg font-bold text-slate-900 truncate">{selectedOrder.id}</h3>
                <p className="text-xs text-slate-500">Placed on {selectedOrder.date}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedOrder.statusTone]}`}>
                  {selectedOrder.status}
                </span>
                <select
                  value={selectedOrder.status}
                  onChange={(event) => handleStatusChange(selectedOrder.id, event.target.value as OrderStatus)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none shadow-sm"
                >
                  {ownerStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Body: 2-col at lg+ */}
            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">

              {/* LEFT SIDEBAR — meta info */}
              <div className="border-b border-slate-100 lg:border-b-0 lg:border-r lg:border-slate-100 p-5 space-y-4 text-sm">

                {/* Payment */}
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">{selectedOrder.paymentMethod}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedOrder.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" :
                      selectedOrder.paymentStatus === "Failed" ? "bg-red-100 text-red-600" :
                      "bg-amber-100 text-amber-700"
                    }`}>{selectedOrder.paymentStatus}</span>
                  </div>
                  {selectedOrder.transactionId !== "-" && (
                    <p className="text-[11px] text-slate-400 font-mono break-all">{selectedOrder.transactionId}</p>
                  )}
                </div>

                {/* Fulfillment / Shipping */}
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fulfillment</p>
                    {!shippingEdit && (
                      <button
                        onClick={() =>
                          setShippingEdit({
                            trackingNumber: selectedOrder.trackingNumber !== "-" ? selectedOrder.trackingNumber : "",
                            carrier: selectedOrder.carrier !== "-" ? selectedOrder.carrier : "",
                            shippingMethod: selectedOrder.shippingMethod !== "Standard" ? selectedOrder.shippingMethod : "",
                            estimatedDelivery: toDateInputValue(selectedOrder.estimatedDelivery),
                          })
                        }
                        className="text-[11px] font-semibold text-[#65bbc5] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {shippingEdit ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Tracking Number"
                        value={shippingEdit.trackingNumber}
                        onChange={(e) => setShippingEdit((s) => s && { ...s, trackingNumber: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#65bbc5]"
                      />
                      <input
                        type="text"
                        placeholder="Carrier (e.g. DHL, FedEx)"
                        value={shippingEdit.carrier}
                        onChange={(e) => setShippingEdit((s) => s && { ...s, carrier: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#65bbc5]"
                      />
                      <input
                        type="text"
                        placeholder="Shipping Method"
                        value={shippingEdit.shippingMethod}
                        onChange={(e) => setShippingEdit((s) => s && { ...s, shippingMethod: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#65bbc5]"
                      />
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Est. Delivery</label>
                        <input
                          type="date"
                          value={shippingEdit.estimatedDelivery}
                          onChange={(e) => setShippingEdit((s) => s && { ...s, estimatedDelivery: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#65bbc5]"
                        />
                      </div>
                      <div className="flex gap-2 pt-0.5">
                        <button
                          onClick={saveShipping}
                          disabled={shippingSaving}
                          className="flex-1 rounded-lg bg-[#65bbc5] px-2 py-1.5 text-xs font-semibold text-white hover:bg-[#53aab5] disabled:opacity-60"
                        >
                          {shippingSaving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => setShippingEdit(null)}
                          disabled={shippingSaving}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-700">
                        {selectedOrder.shippingMethod}{selectedOrder.carrier !== "-" ? ` via ${selectedOrder.carrier}` : ""}
                      </p>
                      {selectedOrder.trackingNumber !== "-" && (
                        <p className="text-[11px] text-slate-500">Tracking: <span className="font-mono">{selectedOrder.trackingNumber}</span></p>
                      )}
                      {selectedOrder.estimatedDelivery !== "-" && (
                        <p className="text-[11px] text-slate-500">Est. delivery: {formatDeliveryDisplay(selectedOrder.estimatedDelivery)}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Ship-to address */}
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ship to</p>
                  <p className="font-semibold text-slate-900 text-sm">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {[selectedOrder.shippingAddress.line1, selectedOrder.shippingAddress.city,
                      [selectedOrder.shippingAddress.state, selectedOrder.shippingAddress.zip].filter(Boolean).join(" "),
                      selectedOrder.shippingAddress.country].filter(Boolean).join(", ")}
                  </p>
                  {selectedOrder.shippingAddress.phone && (
                    <p className="text-xs text-slate-500">{selectedOrder.shippingAddress.phone}</p>
                  )}
                </div>

                {/* Billing address */}
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bill to</p>
                  <p className="font-semibold text-slate-900 text-sm">{selectedOrder.billingAddress.fullName || selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {[
                      selectedOrder.billingAddress.line1 || selectedOrder.shippingAddress.line1,
                      selectedOrder.billingAddress.city || selectedOrder.shippingAddress.city,
                      [(selectedOrder.billingAddress.state || selectedOrder.shippingAddress.state),
                       (selectedOrder.billingAddress.zip || selectedOrder.shippingAddress.zip)].filter(Boolean).join(" "),
                      selectedOrder.billingAddress.country || selectedOrder.shippingAddress.country,
                    ].filter(Boolean).join(", ")}
                  </p>
                  {(selectedOrder.billingAddress.phone || selectedOrder.shippingAddress.phone) && (
                    <p className="text-xs text-slate-500">{selectedOrder.billingAddress.phone || selectedOrder.shippingAddress.phone}</p>
                  )}
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Timeline</p>
                  <div className="space-y-1.5">
                    {selectedOrder.timeline.map((step) => (
                      <div key={step.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${step.complete ? "bg-emerald-400" : "bg-slate-300"}`} />
                          <p className="text-xs font-medium text-slate-800">{step.label}</p>
                        </div>
                        <p className={`text-[11px] ${step.complete ? "text-slate-500" : "text-amber-600"}`}>{step.dateTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — items + totals + notes */}
              <div className="p-5 space-y-4">
                {/* Items */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Items ({selectedOrder.items.length})
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => {
                      const cod = item.customOrderDetails;
                      return (
                        <div key={`${selectedOrder.id}-${item.sku}-${idx}`}
                          className={`rounded-2xl border overflow-hidden ${cod ? "border-purple-200 bg-purple-50/30" : "border-slate-100 bg-slate-50/50"}`}>
                          <div className="flex gap-3 p-3">
                            {item.mainImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.mainImage} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900 leading-snug">{item.name}</p>
                                <p className="text-sm font-bold text-slate-900 flex-shrink-0 tabular-nums">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {item.variant && (
                                  <span className="text-[11px] font-medium bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{item.variant}</span>
                                )}
                                {item.sku && <span className="text-[11px] text-slate-400">SKU {item.sku}</span>}
                                <span className="text-[11px] font-semibold text-slate-500">× {item.quantity}</span>
                                {cod && <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">✎ Custom</span>}
                              </div>
                            </div>
                          </div>
                          {cod && (
                            <div className="mx-3 mb-3 rounded-xl bg-white border border-purple-200 p-3 space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Customer&apos;s Request</p>
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{cod.description}</p>
                              {cod.mediaUrls?.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                  {cod.mediaUrls.map((url, mi) => (
                                    <button key={mi} onClick={() => setLightboxSrc(url)} className="focus:outline-none group">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover border-2 border-purple-100 group-hover:border-purple-400 group-hover:scale-105 transition-all" />
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
                </div>

                {/* Totals */}
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span><span className="tabular-nums">${itemsSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span><span className="tabular-nums">${selectedOrder.shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span><span className="tabular-nums">${selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span><span className="tabular-nums">− ${selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-base">
                    <span>Total</span><span className="tabular-nums">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && selectedOrder.notes !== "No notes for this order." && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Order Notes</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </section>

      <section className="mt-4 text-sm text-slate-500">
        <p>
          Showing {filteredOrders.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} orders
          {filteredOrders.length !== orders.length && ` (filtered from ${orders.length} total)`}
        </p>
      </section>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxSrc} alt="Preview" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </>
  );
}
