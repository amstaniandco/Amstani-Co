"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Download,
  Ellipsis,
  List,
  MapPin,
  PackageSearch,
  Search,
  Store,
  Square,
  Truck,
} from "lucide-react";
import OwnerChatSidebar from "../store/chats/components/OwnerChatSidebar";
import {
  filters,
  getStatusTone,
  orders as baseOrders,
  ownerStatusOptions,
  type OrderRow,
  type OrderStatus,
  statusStyles,
} from "./data";

function SearchField() {
  return (
    <label className="flex min-w-[260px] max-w-[320px] items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-slate-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
      <Search className="h-4 w-4 shrink-0" />
      <span className="sr-only">Search orders</span>
      <input
        type="text"
        placeholder="Search Order ID, Customer Name."
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

function FilterPills() {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {filters.map((filter) => {
        const isActive = filter === "All";

        return (
          <button
            key={filter}
            type="button"
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-[#65bbc5] text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}

type OrdersTableProps = {
  orders: OrderRow[];
  selectedOrderId: string;
  onSelectOrder: (orderId: string) => void;
};

function OrdersTable({ orders, selectedOrderId, onSelectOrder }: OrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.1fr_1.5fr_0.9fr_0.9fr_1fr_0.45fr] border-b border-slate-200 bg-slate-50 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Date</div>
            <div>Total</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelectOrder(order.id)}
                className={`grid w-full grid-cols-[1.1fr_1.5fr_0.9fr_0.9fr_1fr_0.45fr] items-center px-6 py-6 text-left text-sm text-slate-700 transition ${
                  order.id === selectedOrderId ? "bg-slate-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="font-semibold text-slate-900">{order.id}</div>
                <div>
                  <div className="font-medium text-slate-900">{order.customer}</div>
                  <div className="text-xs text-slate-400">{order.email}</div>
                </div>
                <div className="text-slate-500">{order.date}</div>
                <div className="text-lg font-semibold text-slate-900">{order.total}</div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.statusTone]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-end">
                  <span className="text-2xl leading-none text-slate-500">
                    <Ellipsis className="h-5 w-5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>(baseOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(baseOrders[0]?.id ?? "");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0],
    [selectedOrderId],
  );

  const itemsSubtotal =
    selectedOrder?.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ?? 0;

  const grandTotal =
    itemsSubtotal +
    (selectedOrder?.shippingFee ?? 0) +
    (selectedOrder?.taxAmount ?? 0) -
    (selectedOrder?.discountAmount ?? 0);

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        return {
          ...order,
          status: nextStatus,
          statusTone: getStatusTone(nextStatus),
        };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-[#efefef] p-2 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-[#efefef] md:flex-row">
        <OwnerChatSidebar activeLabel="Orders" />

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#65bbc5]" />
              <h1 className="text-xl font-semibold sm:text-2xl">Name of the store here</h1>
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

            <div className="mt-5 flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="shrink-0">
                <SearchField />
              </div>
              <FilterPills />
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
            <OrdersTable orders={orders} selectedOrderId={selectedOrderId} onSelectOrder={setSelectedOrderId} />

            {selectedOrder && (
              <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Order Summary</p>
                    <h3 className="text-xl font-bold text-slate-900">{selectedOrder.id}</h3>
                    <p className="mt-1 text-sm text-slate-500">Placed on {selectedOrder.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedOrder.statusTone]}`}>
                      {selectedOrder.status}
                    </span>
                    <label className="text-xs font-semibold text-slate-500">
                      Status
                      <select
                        value={selectedOrder.status}
                        onChange={(event) => handleStatusChange(selectedOrder.id, event.target.value as OrderStatus)}
                        className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none"
                      >
                        {ownerStatusOptions.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-900">Payment</p>
                      <p>{selectedOrder.paymentMethod}</p>
                      <p className="text-xs text-slate-500">
                        {selectedOrder.paymentStatus} • {selectedOrder.transactionId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-900">Shipping</p>
                      <p>
                        {selectedOrder.shippingMethod} via {selectedOrder.carrier}
                      </p>
                      <p className="text-xs text-slate-500">Tracking: {selectedOrder.trackingNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-900">Estimated Delivery</p>
                      <p>{selectedOrder.estimatedDelivery}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        Shipping Address
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="text-sm text-slate-600">
                        {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}, {selectedOrder.shippingAddress.country}
                      </p>
                      <p className="text-xs text-slate-500">{selectedOrder.shippingAddress.phone}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        Billing Address
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedOrder.billingAddress.fullName}</p>
                      <p className="text-sm text-slate-600">
                        {selectedOrder.billingAddress.line1}, {selectedOrder.billingAddress.city}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zip}, {selectedOrder.billingAddress.country}
                      </p>
                      <p className="text-xs text-slate-500">{selectedOrder.billingAddress.phone}</p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <PackageSearch className="h-3.5 w-3.5" />
                      Items
                    </p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.sku} className="flex items-start justify-between rounded-xl border border-slate-200 px-3 py-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {item.variant} • SKU {item.sku} • Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${itemsSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span>Shipping</span>
                      <span>${selectedOrder.shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span>Tax</span>
                      <span>${selectedOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm text-green-700">
                      <span>Discount</span>
                      <span>- ${selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                      <div className="flex items-center justify-between">
                        <span>Total</span>
                        <span>${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order Notes</p>
                    <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{selectedOrder.notes}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timeline</p>
                    <div className="mt-2 space-y-2">
                      {selectedOrder.timeline.map((step) => (
                        <div key={step.label} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                          <p className="text-sm font-medium text-slate-900">{step.label}</p>
                          <p className={`text-xs ${step.complete ? "text-slate-600" : "text-amber-700"}`}>{step.dateTime}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </section>

          <section className="mt-4 text-sm text-slate-500">
            <p>Showing 4 of 28 orders this week</p>
          </section>
        </main>
      </div>
    </div>
  );
}
