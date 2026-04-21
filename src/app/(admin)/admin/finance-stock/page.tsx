import { Download, ChevronDown } from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";

type RevenuePoint = {
  state: string;
  value: string;
  barHeight: number;
};

type StoreRevenue = {
  name: string;
  sales: string;
  amount: string;
  trend: string;
  positive: boolean;
};

type InventoryRow = {
  sku: string;
  product: string;
  location: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

const revenueByState: RevenuePoint[] = [
  { state: "CA", value: "12.4M", barHeight: 42 },
  { state: "TX", value: "10.1M", barHeight: 38 },
  { state: "NY", value: "9.2M", barHeight: 34 },
  { state: "FL", value: "7.8M", barHeight: 30 },
  { state: "WA", value: "6.4M", barHeight: 26 },
  { state: "IL", value: "5.8M", barHeight: 22 },
  { state: "PA", value: "5.3M", barHeight: 18 },
  { state: "GA", value: "4.2M", barHeight: 14 },
];

const storeRevenues: StoreRevenue[] = [
  { name: "Spice Merchant", sales: "428 Sales", amount: "$82,400", trend: "+2.4%", positive: true },
  { name: "Urban Tech", sales: "372 Sales", amount: "$54,200", trend: "-4.2%", positive: false },
  { name: "Velvet & Vine", sales: "285 Sales", amount: "$41,900", trend: "+8.1%", positive: true },
  { name: "Atlas Outdoors", sales: "198 Sales", amount: "$29,500", trend: "-1.7%", positive: false },
];

const inventoryRows: InventoryRow[] = [
  {
    sku: "ORG-TUR-001",
    product: "Organic Turmeric (500g)",
    location: "Spice Merchant - Downtown",
    stock: 0,
    status: "Out of Stock",
  },
  {
    sku: "PHN-CSE-M15",
    product: "MagSafe Phone Case (Clear)",
    location: "Urban Tech - Mall Center",
    stock: 5,
    status: "Low Stock",
  },
  {
    sku: "VIN-RED-2019",
    product: "Cabernet Sauvignon 2019",
    location: "Velvet & Vine - East Side",
    stock: 142,
    status: "In Stock",
  },
  {
    sku: "ATL-TSH-BLU",
    product: "Performance Tee (Navy)",
    location: "Atlas Outdoors - Plaza",
    stock: 8,
    status: "Low Stock",
  },
  {
    sku: "KTC-BLN-PRO",
    product: "Pro Blender X1000",
    location: "Urban Tech - Mall Center",
    stock: 64,
    status: "In Stock",
  },
];

function getInventoryStatusClass(status: InventoryRow["status"]) {
  if (status === "In Stock") {
    return "bg-[#d7f3f0] text-[#0f766e]";
  }

  if (status === "Low Stock") {
    return "bg-[#ffe8d8] text-[#c05621]";
  }

  return "bg-[#ffe2e2] text-[#c53030]";
}

export default function AdminFinanceStockPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/finance-stock" />

        <main className="rounded-xl border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:rounded-[28px] sm:p-3 md:p-4">
          <AdminNavbar searchPlaceholder="Search financials or stock..." />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-3 border-b border-[#e7edf1] pb-3 sm:pb-4">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl">Revenue & Inventory Monitoring</h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Real-time financial performance and stock logistics oversight.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#dbe5ea] bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:w-auto sm:text-sm"
                >
                  Last 30 Days
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6bbdc7] px-3 py-2 text-xs font-semibold text-white hover:bg-[#5baeb8] sm:w-auto sm:text-sm"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr]">
              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-bold text-slate-800 sm:text-base">Revenue by State</h2>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Total USD (M)</p>
                </div>

                <div className="overflow-x-auto">
                  <div className="flex h-[140px] min-w-[280px] items-end justify-between gap-1.5 border-b border-[#e5edf1] pb-4 sm:gap-2 sm:min-w-[420px] sm:h-[160px]">
                    {revenueByState.map((point) => (
                      <div key={point.state} className="flex min-w-[28px] flex-1 flex-col items-center gap-1.5 sm:min-w-[36px] sm:gap-2">
                        <span className="text-[9px] font-semibold text-[#2f8ea3] sm:text-[10px]">{point.value}</span>
                        <div
                          className="w-5 rounded-t-md bg-gradient-to-t from-[#6bbdc7] to-[#8fd1d8] sm:w-7"
                          style={{ height: `${point.barHeight * 0.85}px` }}
                        />
                        <span className="text-[9px] font-medium text-slate-600 sm:text-[10px]">{point.state}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
                <h2 className="mb-4 text-sm font-bold text-slate-800 sm:text-base">Store-wise Revenue</h2>

                <div className="space-y-2">
                  {storeRevenues.map((store) => (
                    <div key={store.name} className="rounded-lg border border-[#e7edf1] bg-[#fbfdfe] px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 sm:text-sm">{store.name}</p>
                          <p className="text-[10px] text-slate-500">{store.sales}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-slate-800 sm:text-sm">{store.amount}</p>
                          <p className={`text-[10px] font-semibold ${store.positive ? "text-emerald-600" : "text-rose-600"}`}>
                            {store.trend}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <article className="mt-4 rounded-lg border border-[#dbe5ea] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:rounded-xl sm:p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                  Master Inventory Monitor
                  <span className="ml-1 text-[10px] font-normal text-slate-500 sm:text-[11px]">(View-Only)</span>
                </h2>
                <span className="w-fit rounded-md bg-[#f4f8fb] px-2 py-1 text-[10px] font-medium text-slate-500">
                  Last Sync: 2 mins ago
                </span>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-2.5 md:hidden">
                {inventoryRows.map((row) => (
                  <div key={row.sku} className="rounded-lg border border-[#e7edf1] bg-[#fbfdfe] p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-[10px] font-medium text-[#3b8da1]">{row.sku}</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{row.product}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold flex-shrink-0 ${getInventoryStatusClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mb-1.5">{row.location}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Stock:</span>
                      <span className="font-semibold text-slate-800">{row.stock}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="border-y border-[#e5edf1] bg-[#f8fbfc] text-[10px] uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">SKU ID</th>
                      <th className="px-3 py-2.5 font-semibold">PRODUCT NAME</th>
                      <th className="px-3 py-2.5 font-semibold">STORE LOCATION</th>
                      <th className="px-3 py-2.5 font-semibold">CURRENT STOCK</th>
                      <th className="px-3 py-2.5 font-semibold">INVENTORY STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryRows.map((row) => (
                      <tr key={row.sku} className="border-b border-[#e7edf1] text-slate-700">
                        <td className="px-3 py-3 font-medium text-[#3b8da1]">{row.sku}</td>
                        <td className="px-3 py-3 font-semibold text-slate-800">{row.product}</td>
                        <td className="px-3 py-3 text-slate-600">{row.location}</td>
                        <td className="px-3 py-3 font-semibold text-slate-800">{row.stock}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${getInventoryStatusClass(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
