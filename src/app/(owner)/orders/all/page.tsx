"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Search, Store } from "lucide-react";
import { mapOrderToRow, statusStyles, type OrderRow } from "../data";

export default function OwnerAllOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/owner/orders")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load orders");
        return data;
      })
      .then((data) => setOrders((data.orders ?? []).map(mapOrderToRow)))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.email.toLowerCase().includes(q) ||
        order.status.toLowerCase().includes(q),
    );
  }, [orders, query]);

  return (
    <main>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-900">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">All Orders</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Summary
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-[32px] bg-white px-4 py-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] sm:px-6 sm:py-8">
        <div className="mb-5 flex max-w-[380px] items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-slate-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by order ID, customer, email"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-4 font-bold">Order ID</th>
                  <th className="px-5 py-4 font-bold">Customer</th>
                  <th className="px-5 py-4 font-bold">Date</th>
                  <th className="px-5 py-4 font-bold">Total</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Payment</th>
                  <th className="px-5 py-4 font-bold">Carrier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                      Loading orders...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-red-500">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && !visibleOrders.length && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                      No orders found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  visibleOrders.map((order) => (
                    <tr key={order.id} className="text-sm text-slate-700">
                      <td className="px-5 py-4 font-semibold text-slate-900">{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{order.customer}</p>
                        <p className="text-xs text-slate-500">{order.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{order.date}</td>
                      <td className="px-5 py-4 text-base font-semibold text-slate-900">{order.total}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.statusTone]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{order.paymentStatus}</p>
                        <p className="text-xs text-slate-500">{order.paymentMethod}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{order.carrier}</p>
                        <p className="text-xs text-slate-500">{order.trackingNumber}</p>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing {visibleOrders.length} of {orders.length} orders
        </p>
      </section>
    </main>
  );
}
