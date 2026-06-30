"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  ChevronDown,
  Search,
  RefreshCw,
  Package,
  MapPin,
  User,
  Truck,
  Store as StoreIcon,
  ListPlus,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  productId: string | null;
  productName: string | null;
  size: string | null;
  color: string | null;
  globalProductId: string | null;
  sku: string | null;
  image: string | null;
  brand: string | null;
  category: string | null;
};

type StoreMatch = { storeId: string; storeName: string } | null;

type ListingOrder = {
  id: string;
  status: string | null;
  fulfillmentStatus: string | null;
  total: number;
  currency: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  estimatedDelivery: string | null;
  userId: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  orderNotes: string | null;
  shippingFirstName: string | null;
  shippingLastName: string | null;
  shippingCompany: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  items: OrderItem[];
  store: StoreMatch;
  alreadyListed: boolean;
};

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-600",
  REFUNDED: "bg-slate-200 text-slate-600",
};

const fulfillmentColors: Record<string, string> = {
  SHIPPED: "bg-sky-100 text-sky-700",
  NOT_SHIPPED: "bg-slate-100 text-slate-600",
  DELIVERED: "bg-emerald-100 text-emerald-700",
};

function fmtMoney(value: number | null | undefined, currency: string | null) {
  const n = typeof value === "number" ? value : 0;
  const code = currency || "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function fullName(first: string | null, last: string | null) {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value || "—"}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {icon}{title}
      </p>
      {children}
    </div>
  );
}

function OrderCard({ order }: { order: ListingOrder }) {
  const [open, setOpen] = useState(false);
  const [listing, setListing] = useState(false);
  const [listed, setListed] = useState(order.alreadyListed ?? false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const itemCount = order.items.reduce((s, i) => s + (i.quantity || 0), 0);
  const mappable = order.items.filter((i) => i.globalProductId).length;
  // Only the products actually present in the global catalog can be listed.
  const listableItems = order.items.filter((i) => i.globalProductId);

  async function listToStore() {
    setListing(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          email: order.customerEmail,
          items: order.items
            .filter((i) => i.productId)
            .map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, text: data.error || data.detail || "Failed to list." });
        return;
      }
      setResult({ ok: true, text: data.message || "Listed successfully." });
      setListed(true);          // lock the button — already listed
      setConfirmOpen(false);    // close the confirmation modal
    } catch {
      setResult({ ok: false, text: "Network error while listing." });
    } finally {
      setListing(false);
    }
  }

  const shippingLines = [
    fullName(order.shippingFirstName, order.shippingLastName),
    order.shippingCompany,
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    [order.shippingCity, order.shippingState, order.shippingPostalCode].filter(Boolean).join(", "),
    order.shippingCountry,
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Summary header */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-400">#{order.id.slice(0, 8)}</span>
              {order.status && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[order.status] ?? "bg-slate-100 text-slate-600"}`}>{order.status}</span>
              )}
              {order.fulfillmentStatus && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${fulfillmentColors[order.fulfillmentStatus] ?? "bg-slate-100 text-slate-600"}`}>{order.fulfillmentStatus.replace(/_/g, " ")}</span>
              )}
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              {fullName(order.shippingFirstName, order.shippingLastName)}
              <span className="font-normal text-slate-400"> · {order.customerEmail || "no email"}</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{fmtDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? "" : "s"}</p>
          </div>
          <p className="shrink-0 text-base font-extrabold text-slate-900">{fmtMoney(order.total, order.currency)}</p>
          <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Products to list — always visible: pic, name, SKU, amount */}
      <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <Package className="h-3.5 w-3.5" />
          Products to list
        </p>
        <div className="space-y-2">
          {order.items.length === 0 ? (
            <p className="text-sm text-slate-400">No products on this order.</p>
          ) : (
            order.items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={it.productName ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-300">No image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{it.productName || "—"}</p>
                  <p className="text-xs text-slate-400">SKU: {it.sku || "—"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Amount to list</p>
                  <p className="text-sm font-extrabold text-slate-800">{it.quantity}</p>
                </div>
                {!it.globalProductId && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">not in catalog</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* List action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <StoreIcon className="h-4 w-4" />
          {order.store ? (
            <span>Target store: <span className="font-semibold text-slate-700">{order.store.storeName}</span></span>
          ) : (
            <span className="text-amber-600">No store found for this email</span>
          )}
          <span className="text-slate-300">·</span>
          <span>{mappable}/{order.items.length} product{order.items.length === 1 ? "" : "s"} in catalog</span>
        </div>
        {listed ? (
          <span className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            <Check className="h-4 w-4" />
            Listed
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={listing || !order.store || mappable === 0}
            title={
              !order.store
                ? "No store owned by this email"
                : mappable === 0
                ? "None of these products are in the global catalog"
                : "List these products into the store"
            }
            className="flex items-center gap-2 rounded-xl bg-[#4ba7b3] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3d8f99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ListPlus className="h-4 w-4" />
            {listing ? "Listing…" : "List to Store"}
          </button>
        )}
      </div>

      {/* Confirmation modal — review products + stock before listing */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => !listing && setConfirmOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4f6] text-[#338ca0]">
                  <ListPlus className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">List products to store</h3>
                  <p className="text-xs text-slate-500">
                    Into <span className="font-semibold text-slate-700">{order.store?.storeName}</span> · order #{order.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !listing && setConfirmOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4">
              <p className="mb-3 text-sm text-slate-600">
                The following {listableItems.length === 1 ? "product" : `${listableItems.length} products`} will be listed with the stock shown:
              </p>
              <div className="space-y-2">
                {listableItems.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt={it.productName ?? ""} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-300">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{it.productName || "—"}</p>
                      <p className="text-xs text-slate-400">SKU: {it.sku || "—"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Stock to list</p>
                      <p className="text-base font-extrabold text-[#338ca0]">{it.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              {mappable < order.items.length && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {order.items.length - mappable} product(s) on this order aren&apos;t in the global catalog and will be skipped.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={listing}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={listToStore}
                disabled={listing}
                className="flex items-center gap-2 rounded-xl bg-[#4ba7b3] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#3d8f99] disabled:opacity-50"
              >
                <ListPlus className="h-4 w-4" />
                {listing ? "Listing…" : `Confirm & list ${listableItems.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className={`flex items-start gap-2 border-t px-4 py-2.5 text-sm sm:px-5 ${result.ok ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-red-100 bg-red-50 text-red-700"}`}>
          {result.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{result.text}</span>
        </div>
      )}

      {/* Expanded detail: Customer · Products · Fulfilment */}
      {open && (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Customer / person who made the order */}
            <SectionCard title="Customer" icon={<User className="h-3.5 w-3.5" />}>
              <DetailRow label="Name" value={fullName(order.shippingFirstName, order.shippingLastName)} />
              <DetailRow label="Email" value={order.customerEmail} />
              <DetailRow label="Phone" value={order.customerPhone} />
              <DetailRow label="User ID" value={order.userId ? <span className="font-mono text-[11px]">{order.userId.slice(0, 18)}…</span> : "—"} />
            </SectionCard>

            {/* Fulfilment */}
            <SectionCard title="Fulfilment" icon={<Truck className="h-3.5 w-3.5" />}>
              <DetailRow label="Status" value={order.fulfillmentStatus?.replace(/_/g, " ")} />
              <DetailRow label="Carrier" value={order.carrier} />
              <DetailRow label="Tracking #" value={order.trackingNumber} />
              <DetailRow label="Shipped at" value={fmtDate(order.shippedAt)} />
              <DetailRow label="Est. delivery" value={fmtDate(order.estimatedDelivery)} />
              <div className="mt-2 border-t border-slate-100 pt-2">
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><MapPin className="h-3 w-3" />Shipping address</p>
                <div className="space-y-0.5 text-sm text-slate-700">
                  {(shippingLines.length ? shippingLines : ["—"]).map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Products — complete detail */}
          <SectionCard title="Products" icon={<Package className="h-3.5 w-3.5" />}>
            <div className="space-y-3">
              {order.items.length === 0 ? (
                <p className="text-sm text-slate-400">No products on this order.</p>
              ) : (
                order.items.map((it) => (
                  <div key={it.id} className="flex gap-3 rounded-lg border border-slate-100 p-2.5">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt={it.productName ?? ""} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-300">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{it.productName || "—"}</p>
                      <p className="text-xs text-slate-400">
                        {it.sku ? `SKU ${it.sku}` : "no sku"}
                        {it.brand ? ` · ${it.brand}` : ""}
                        {it.category ? ` · ${it.category}` : ""}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-600">
                        <span>Size: <b>{it.size || "—"}</b></span>
                        <span>Color: <b>{it.color || "—"}</b></span>
                        <span>Qty: <b>{it.quantity}</b></span>
                        <span>Unit: <b>{fmtMoney(it.price, order.currency)}</b></span>
                        <span>Subtotal: <b>{fmtMoney(it.price * it.quantity, order.currency)}</b></span>
                      </div>
                      {!it.globalProductId && (
                        <p className="mt-1 text-[11px] font-semibold text-amber-600">⚠ Not in global catalog — can&apos;t be listed</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

export default function AdminListingPage() {
  const [orders, setOrders] = useState<ListingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/listing");
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to load orders");
      setOrders(data.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const statuses = useMemo(
    () => Array.from(new Set(orders.map((o) => o.status).filter(Boolean))) as string[],
    [orders]
  );

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.customerEmail ?? "").toLowerCase().includes(q) ||
      (o.customerPhone ?? "").toLowerCase().includes(q) ||
      fullName(o.shippingFirstName, o.shippingLastName).toLowerCase().includes(q) ||
      o.items.some((it) => (it.productName ?? "").toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/listing" className="admin-sidebar-flush" />

        <main className="admin-main-scroll">
          <AdminNavbar />

          <div className="mt-4 rounded-3xl border border-[#dbe5eb] bg-white/75 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.07)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold leading-tight text-[#4ba7b3] sm:text-3xl">
                  <ClipboardList className="h-7 w-7" />
                  Order Listing
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Orders from Supabase — customer, products and fulfilment. Use <b>List to Store</b> to list an order&apos;s products into the customer&apos;s store.
                </p>
              </div>
              <button
                onClick={() => load(true)}
                disabled={loading || refreshing}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {/* Controls */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order #, customer, email, phone or product…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">All statuses</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="text-sm text-slate-500">{loading ? "" : `${filtered.length} of ${orders.length}`}</span>
            </div>

            {/* List */}
            <div className="mt-5 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-20 text-center text-slate-400">
                  {orders.length === 0 ? "No orders found in Supabase." : "No orders match your filters."}
                </div>
              ) : (
                filtered.map((o) => <OrderCard key={o.id} order={o} />)
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
