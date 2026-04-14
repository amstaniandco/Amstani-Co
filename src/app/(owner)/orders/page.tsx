import {
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  Search,
  Store,
  Square,
} from "lucide-react";
import OwnerChatSidebar from "../store/chats/components/OwnerChatSidebar";

type OrderStatus = "Incoming" | "Accepted" | "On Hold" | "Shipped";

type OrderRow = {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: string;
  status: OrderStatus;
  statusTone: "green" | "gray" | "amber" | "blue";
};

const orders: OrderRow[] = [
  {
    id: "#AM-9921",
    customer: "Eleanor Shellstrop",
    email: "eleanor.s@example.com",
    date: "Oct 24, 2023",
    total: "$450.00",
    status: "Incoming",
    statusTone: "green",
  },
  {
    id: "#AM-9922",
    customer: "Chidi Anagonye",
    email: "chidi.a@university.edu",
    date: "Oct 24, 2023",
    total: "$1,200.00",
    status: "Accepted",
    statusTone: "gray",
  },
  {
    id: "#AM-9923",
    customer: "Tahani Al-Jamil",
    email: "tahani@aljamil.co.uk",
    date: "Oct 23, 2023",
    total: "$890.00",
    status: "On Hold",
    statusTone: "amber",
  },
  {
    id: "#AM-9924",
    customer: "Jason Mendoza",
    email: "bortles.fan@jax.com",
    date: "Oct 22, 2023",
    total: "$120.00",
    status: "Shipped",
    statusTone: "blue",
  },
];

const statusStyles: Record<OrderRow["statusTone"], string> = {
  green: "bg-green-100 text-green-700",
  gray: "bg-slate-200 text-slate-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
};

const filters = ["All", "Incoming", "Accepted", "On Hold", "Dispatched"];

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

function OrdersTable() {
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
              <div
                key={order.id}
                className="grid grid-cols-[1.1fr_1.5fr_0.9fr_0.9fr_1fr_0.45fr] items-center px-6 py-6 text-sm text-slate-700"
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
                  <button type="button" className="text-2xl leading-none text-slate-500 hover:text-slate-900">
                    <Ellipsis className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerOrdersPage() {
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

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>

            <div className="mt-5 flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="shrink-0">
                <SearchField />
              </div>
              <FilterPills />
            </div>
          </section>

          <section className="mt-4">
            <OrdersTable />
          </section>

          <section className="mt-4 flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Showing 4 of 28 orders this week</p>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-400 bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-400 bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
