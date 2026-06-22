"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, List, Search, X } from "lucide-react";
import {
  getStatusTone,
  mapOrderToRow,
  ownerStatusOptions,
  type OrderRow,
  type OrderStatus,
  statusStyles,
} from "./data";

const STATUS_FILTERS = ["All", "Incoming", "Accepted", "Rejected", "On Hold", "Dispatched", "Shipped", "Delivered"];
const PAGE_SIZE = 20;

/* ── helpers ─────────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase() || "?";
}

function toDateInputValue(str: string) {
  if (!str || str === "-") return "";
  const d = new Date(str);
  return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDelivery(str: string) {
  if (!str || str === "-") return str;
  const d = new Date(str.includes("T") ? str : `${str}T00:00:00`);
  return isNaN(d.getTime()) ? str : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ── pagination ──────────────────────────────────────────────── */
function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1}
        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition">
        <ChevronLeft className="h-3.5 w-3.5" /> Prev
      </button>
      <span className="text-xs text-slate-400">Page {page} / {total}</span>
      <button type="button" onClick={() => onPage(page + 1)} disabled={page === total}
        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition">
        Next <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── order list (left panel) ─────────────────────────────────── */
function OrderList({
  orders, selectedId, onSelect,
  query, onQuery,
  filter, onFilter,
  page, totalPages, onPage,
  totalAll, totalFiltered,
}: {
  orders: OrderRow[]; selectedId: string; onSelect: (id: string) => void;
  query: string; onQuery: (v: string) => void;
  filter: string; onFilter: (v: string) => void;
  page: number; totalPages: number; onPage: (p: number) => void;
  totalAll: number; totalFiltered: number;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(15,23,42,0.07)] border border-slate-100 h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <input type="text" value={query} onChange={(e) => onQuery(e.target.value)}
            placeholder="Search by ID or customer…"
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
          {query && (
            <button type="button" onClick={() => onQuery("")} className="shrink-0 text-slate-400 hover:text-slate-600 transition">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STATUS_FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => onFilter(f)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
              filter === f ? "bg-[#65bbc5] text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2">
        <p className="text-[11px] font-medium text-slate-400">
          {totalFiltered === 0 ? "No orders" : `${totalFiltered} order${totalFiltered !== 1 ? "s" : ""}`}
          {totalFiltered !== totalAll && <span className="text-slate-300"> of {totalAll}</span>}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-slate-400">No orders found</p>
            <p className="text-xs text-slate-300">Try adjusting your filters</p>
          </div>
        ) : orders.map((order) => {
          const active = order.id === selectedId;
          return (
            <button key={order.id} type="button" onClick={() => onSelect(order.id)}
              className={`group w-full text-left px-4 py-3 transition-all ${active ? "bg-[#f0fbfc]" : "hover:bg-slate-50"}`}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                  active ? "bg-[#65bbc5] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}>
                  {initials(order.customer)}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold truncate ${active ? "text-[#3a9baa]" : "text-slate-800"}`}>
                      {order.id}
                    </p>
                    <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[order.statusTone]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 truncate">{order.customer}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-slate-400">{order.date}</p>
                    <p className={`text-xs font-bold tabular-nums ${active ? "text-[#3a9baa]" : "text-slate-700"}`}>{order.total}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Pagination page={page} total={totalPages} onPage={onPage} />
    </div>
  );
}

/* ── order detail (right panel) ──────────────────────────────── */
type ShippingEdit = { trackingNumber: string; carrier: string; shippingMethod: string; estimatedDelivery: string };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{title}</p>
      {children}
    </div>
  );
}

function OrderDetail({
  order, onStatusChange, onClose,
  shippingEdit, setShippingEdit, shippingSaving, saveShipping,
  setLightboxSrc,
}: {
  order: OrderRow; onStatusChange: (id: string, s: OrderStatus) => void; onClose?: () => void;
  shippingEdit: ShippingEdit | null; setShippingEdit: (v: ShippingEdit | null) => void;
  shippingSaving: boolean; saveShipping: () => void; setLightboxSrc: (s: string) => void;
}) {
  const subtotal = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const grandTotal = subtotal + order.shippingFee + order.taxAmount - order.discountAmount;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(15,23,42,0.07)] border border-slate-100 h-full">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-100">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            {onClose && (
              <button type="button" onClick={onClose}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#65bbc5] hover:text-[#53aab5] transition lg:hidden">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">{order.id}</h3>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[order.statusTone]}`}>
                  {order.status}
                </span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  order.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" :
                  order.paymentStatus === "Failed" ? "bg-red-100 text-red-600" :
                  "bg-amber-100 text-amber-700"
                }`}>{order.paymentStatus}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Placed {order.date} · {order.customer}</p>
            </div>
          </div>

          {/* Status change */}
          <div className="shrink-0">
            <select value={order.status} onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition cursor-pointer">
              {ownerStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-0 lg:grid-cols-[260px_1fr]">

          {/* Left meta column */}
          <div className="space-y-5 border-b border-slate-100 p-5 lg:border-b-0 lg:border-r">

            <Section title="Fulfillment">
              <div className="rounded-xl bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">{order.shippingMethod}{order.carrier !== "-" ? ` · ${order.carrier}` : ""}</p>
                  {!shippingEdit && (
                    <button onClick={() => setShippingEdit({
                      trackingNumber: order.trackingNumber !== "-" ? order.trackingNumber : "",
                      carrier: order.carrier !== "-" ? order.carrier : "",
                      shippingMethod: order.shippingMethod !== "Standard" ? order.shippingMethod : "",
                      estimatedDelivery: toDateInputValue(order.estimatedDelivery),
                    })} className="text-[11px] font-semibold text-[#65bbc5] hover:underline transition">Edit</button>
                  )}
                </div>
                {shippingEdit ? (
                  <div className="space-y-2">
                    {[
                      { ph: "Tracking Number", key: "trackingNumber" },
                      { ph: "Carrier (e.g. DHL)", key: "carrier" },
                      { ph: "Shipping Method", key: "shippingMethod" },
                    ].map(({ ph, key }) => (
                      <input key={key} type="text" placeholder={ph} value={(shippingEdit as Record<string, string>)[key]}
                        onChange={(e) => setShippingEdit({ ...shippingEdit, [key]: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#65bbc5] transition" />
                    ))}
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Est. Delivery</label>
                      <input type="date" value={shippingEdit.estimatedDelivery}
                        onChange={(e) => setShippingEdit({ ...shippingEdit, estimatedDelivery: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#65bbc5] transition" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveShipping} disabled={shippingSaving}
                        className="flex-1 rounded-lg bg-[#65bbc5] py-1.5 text-xs font-semibold text-white hover:bg-[#53aab5] disabled:opacity-60 transition">
                        {shippingSaving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setShippingEdit(null)} disabled={shippingSaving}
                        className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {order.trackingNumber !== "-" && (
                      <p className="text-[11px] text-slate-500">Tracking: <span className="font-mono text-slate-700">{order.trackingNumber}</span></p>
                    )}
                    {order.estimatedDelivery !== "-" && (
                      <p className="text-[11px] text-slate-500">Est. delivery: <span className="text-slate-700">{fmtDelivery(order.estimatedDelivery)}</span></p>
                    )}
                  </>
                )}
              </div>
            </Section>

            <Section title="Ship To">
              <div className="rounded-xl bg-slate-50 p-3 space-y-0.5">
                <p className="text-xs font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {[order.shippingAddress.line1, order.shippingAddress.city,
                    [order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(" "),
                    order.shippingAddress.country].filter(Boolean).join(", ")}
                </p>
                {order.shippingAddress.phone && <p className="text-[11px] text-slate-400">{order.shippingAddress.phone}</p>}
              </div>
            </Section>

            <Section title="Payment">
              <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-700">{order.paymentMethod}</p>
                {order.transactionId !== "-" && (
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{order.transactionId}</p>
                )}
              </div>
            </Section>

            <Section title="Timeline">
              <div className="space-y-1.5">
                {order.timeline.map((step) => (
                  <div key={step.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${step.complete ? "bg-[#65bbc5]" : "bg-slate-300"}`} />
                      <p className={`text-[11px] font-medium ${step.complete ? "text-slate-700" : "text-slate-400"}`}>{step.label}</p>
                    </div>
                    <p className={`text-[10px] ${step.complete ? "text-slate-500" : "text-amber-500"}`}>{step.dateTime}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Right items column */}
          <div className="space-y-5 p-5">
            <Section title={`Items (${order.items.length})`}>
              <div className="space-y-2">
                {order.items.map((item, idx) => {
                  const cod = item.customOrderDetails;
                  return (
                    <div key={`${order.id}-${idx}`}
                      className={`rounded-xl border overflow-hidden ${cod ? "border-purple-200" : "border-slate-100"}`}>
                      <div className="flex gap-3 p-3">
                        {item.mainImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.mainImage} alt={item.name}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover border border-slate-100 shadow-sm" />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-400">{item.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 leading-snug">{item.name}</p>
                            <p className="text-xs font-bold text-slate-900 shrink-0 tabular-nums">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {item.variant && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{item.variant}</span>
                            )}
                            {item.sku && <span className="text-[10px] text-slate-400">SKU {item.sku}</span>}
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">×{item.quantity}</span>
                            {cod && (
                              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-600">Custom</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {cod && (
                        <div className="mx-3 mb-3 rounded-xl bg-purple-50 border border-purple-100 p-3 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Customer's Request</p>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{cod.description}</p>
                          {cod.mediaUrls?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {cod.mediaUrls.map((url, mi) => (
                                <button key={mi} onClick={() => setLightboxSrc(url)} className="focus:outline-none group">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt=""
                                    className="h-16 w-16 rounded-lg object-cover border-2 border-purple-100 group-hover:border-purple-400 group-hover:scale-105 transition-all" />
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
            </Section>

            {/* Totals */}
            <Section title="Summary">
              <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                <div className="space-y-0 divide-y divide-slate-100">
                  {[
                    { label: "Subtotal", val: `$${subtotal.toFixed(2)}`, muted: true },
                    { label: "Shipping", val: `$${order.shippingFee.toFixed(2)}`, muted: true },
                    { label: "Tax", val: `$${order.taxAmount.toFixed(2)}`, muted: true },
                    ...(order.discountAmount > 0 ? [{ label: "Discount", val: `−$${order.discountAmount.toFixed(2)}`, muted: false, green: true }] : []),
                  ].map(({ label, val, muted, green }) => (
                    <div key={label} className={`flex justify-between px-4 py-2.5 text-xs ${green ? "text-emerald-600" : muted ? "text-slate-500" : ""}`}>
                      <span>{label}</span><span className="tabular-nums font-medium">{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 text-sm font-bold text-slate-900 bg-white">
                    <span>Total</span><span className="tabular-nums">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Section>

            {order.notes && order.notes !== "No notes for this order." && (
              <Section title="Order Notes">
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <p className="text-xs text-amber-800 leading-relaxed">{order.notes}</p>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("My Store");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [shippingEdit, setShippingEdit] = useState<ShippingEdit | null>(null);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);

  const fetchOrders = useCallback(() => {
    fetch("/api/owner/orders")
      .then((r) => r.json())
      .then((data) => {
        if (!data.orders) throw new Error(data.error || "Failed to load orders");
        const mapped = (data.orders ?? []).map(mapOrderToRow);
        setOrders(mapped);
        setStoreName(data.storeName ?? "My Store");
        const params = new URLSearchParams(window.location.search);
        const target = params.get("orderId");
        if (target) {
          const match = mapped.find((o: OrderRow) => o._mongoId === target);
          if (match) {
            setSelectedId(match.id);
            const idx = mapped.findIndex((o: OrderRow) => o._mongoId === target);
            if (idx >= 0) setPage(Math.floor(idx / PAGE_SIZE) + 1);
            return;
          }
        }
        setSelectedId((cur) => cur || mapped[0]?.id || "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => {
    localStorage.setItem("sb_seen_owner_orders", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("sb-seen", { detail: "owner_orders" }));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const ok = filter === "All" || o.status === filter;
      const qok = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
      return ok && qok;
    });
  }, [filter, orders, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [filter, query]);

  const visible = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? orders[0], [orders, selectedId]);

  const handleStatusChange = async (orderId: string, next: OrderStatus) => {
    const prev = orders.find((o) => o.id === orderId);
    if (!prev) return;
    setOrders((all) => all.map((o) => o.id === orderId ? { ...o, status: next, statusTone: getStatusTone(next) } : o));
    const res = await fetch("/api/owner/orders", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: prev._mongoId ?? orderId, status: next }),
    });
    if (!res.ok) setOrders((all) => all.map((o) => o.id === orderId ? prev : o));
  };

  const saveShipping = async () => {
    if (!selected || !shippingEdit) return;
    setShippingSaving(true);
    try {
      const res = await fetch("/api/owner/orders", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selected._mongoId ?? selected.id, shipping: shippingEdit }),
      });
      if (res.ok) {
        setOrders((all) => all.map((o) => o.id === selected.id ? {
          ...o,
          trackingNumber: shippingEdit.trackingNumber || "-",
          carrier: shippingEdit.carrier || "-",
          shippingMethod: shippingEdit.shippingMethod || "Standard",
          estimatedDelivery: shippingEdit.estimatedDelivery || "-",
        } : o));
        setShippingEdit(null);
      }
    } finally { setShippingSaving(false); }
  };

  useEffect(() => { setShippingEdit(null); }, [selectedId]);

  const handleSelect = (id: string) => { setSelectedId(id); setMobileDetail(true); };

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="flex h-full flex-col gap-4 pb-4">
      {/* Page header */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Orders</h1>
          <p className="text-xs text-slate-500">{storeName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/orders/all"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            <List className="h-3.5 w-3.5" /> All Orders
          </Link>
          <button type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Split panel — fills remaining height */}
      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center space-y-2">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-[#65bbc5]" />
              <p className="text-sm text-slate-400">Loading orders…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-red-100 bg-white">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
            {/* Left */}
            <div className={mobileDetail ? "hidden lg:flex lg:flex-col" : "flex flex-col"}>
              <OrderList
                orders={visible} selectedId={selectedId} onSelect={handleSelect}
                query={query} onQuery={setQuery}
                filter={filter} onFilter={setFilter}
                page={page} totalPages={totalPages} onPage={setPage}
                totalAll={orders.length} totalFiltered={filtered.length}
              />
            </div>

            {/* Right */}
            <div className={mobileDetail ? "flex flex-col" : "hidden lg:flex lg:flex-col"}>
              {selected ? (
                <OrderDetail
                  order={selected} onStatusChange={handleStatusChange} onClose={() => setMobileDetail(false)}
                  shippingEdit={shippingEdit} setShippingEdit={setShippingEdit}
                  shippingSaving={shippingSaving} saveShipping={saveShipping}
                  setLightboxSrc={setLightboxSrc}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-slate-100 bg-white">
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-slate-400">No order selected</p>
                    <p className="text-xs text-slate-300">Click an order from the list</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightboxSrc(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxSrc} alt="Preview" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
