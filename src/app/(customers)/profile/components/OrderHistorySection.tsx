"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../../../components/global/ToastProvider";

type RawOrderItem = {
  price?: number;
  quantity?: number;
};

type RawOrder = {
  _id?: string;
  orderNumber?: string;
  createdAt?: string;
  status?: string;
  total?: number;
  subtotal?: number;
  shippingFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  totals?: {
    total?: number;
  };
  items?: RawOrderItem[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeStatus(status?: string) {
  if (!status) return "Incoming";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getOrderTotal(order: RawOrder) {
  if (typeof order.total === "number") return order.total;
  if (typeof order.totals?.total === "number") return order.totals.total;

  const itemSubtotal = (order.items ?? []).reduce(
    (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
    0,
  );
  const subtotal = Number(order.subtotal ?? itemSubtotal);
  return subtotal + Number(order.shippingFee ?? 0) + Number(order.taxAmount ?? 0) - Number(order.discountAmount ?? 0);
}

export default function OrderHistorySection() {
  const toast = useToast();
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load orders");
        return data;
      })
      .then((data) => setOrders(data.orders ?? []))
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load orders");
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const rows = useMemo(
    () =>
      orders.map((order) => ({
        id: order.orderNumber || order._id || "-",
        rawId: order._id || "",
        date: formatDate(order.createdAt),
        total: formatCurrency(getOrderTotal(order)),
        status: normalizeStatus(order.status),
      })),
    [orders],
  );

  return (
    <section className="ui-panel mt-6 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Order History</h2>
        <Link
          href="/my-orders"
          className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-300"
        >
          View All →
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Loading orders...
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            No orders yet.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3">Order ID</th>
                <th className="py-3">Date</th>
                <th className="py-3">Total Price</th>
                <th className="py-3">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {rows.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-100">{order.id}</td>
                  <td className="py-3">{order.date}</td>
                  <td className="py-3">{order.total}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={order.rawId ? `/claims?orderId=${order.rawId}` : "/claims"}
                      className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-300"
                    >
                      Open Claim
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
