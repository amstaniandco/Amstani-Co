import { CircleCheck, CircleSlash, Download, Ellipsis, Filter, PhoneCall, Search, ShieldAlert } from "lucide-react";

export type StoreStatus = "Active" | "Suspended" | "Dormant";

export type StoreRow = {
  id: string;
  name: string;
  status: StoreStatus;
  owner: string;
  onboarding: string;
  revenue: string;
  rating: string;
  ownerEmail?: string;
  ownerPhone?: string;
  location?: string;
  category?: string;
  monthlyOrders?: string;
  fulfillmentRate?: string;
  returnRate?: string;
  escalationRisk?: string;
};

type StoreManagementTableProps = {
  rows?: StoreRow[];
  selectedStoreId?: string;
  onSelectStore?: (store: StoreRow) => void;
};

export const defaultRows: StoreRow[] = [
  {
    id: "STN-8232",
    name: "Artisanal Goods",
    status: "Active",
    owner: "Elina Rodriguez",
    onboarding: "12 Jan 2024",
    revenue: "$12,450",
    rating: "4.8",
    ownerEmail: "elina.r@artisanal-goods.com",
    ownerPhone: "+1 (415) 555-1948",
    location: "San Francisco, CA",
    category: "Home Decor",
    monthlyOrders: "842",
    fulfillmentRate: "98.4%",
    returnRate: "1.7%",
    escalationRisk: "Low",
  },
  {
    id: "STN-8905",
    name: "The Spice Merchant",
    status: "Suspended",
    owner: "Rajesh Patel",
    onboarding: "05 Nov 2023",
    revenue: "$2,100",
    rating: "4.2",
    ownerEmail: "rajesh@spicemerchant.io",
    ownerPhone: "+91 98220 44117",
    location: "Pune, India",
    category: "Food & Grocery",
    monthlyOrders: "197",
    fulfillmentRate: "83.1%",
    returnRate: "6.9%",
    escalationRisk: "High",
  },
  {
    id: "STN-8895",
    name: "Vintage Vault",
    status: "Dormant",
    owner: "Sarah Jenkins",
    onboarding: "20 Dec 2023",
    revenue: "$0",
    rating: "0.0",
    ownerEmail: "s.jenkins@vintagevault.shop",
    ownerPhone: "+44 20 7946 1120",
    location: "London, UK",
    category: "Vintage Apparel",
    monthlyOrders: "0",
    fulfillmentRate: "0%",
    returnRate: "0%",
    escalationRisk: "Medium",
  },
  {
    id: "STN-8901",
    name: "Vintage Vault",
    status: "Dormant",
    owner: "Sarah Jenkins",
    onboarding: "20 Dec 2023",
    revenue: "$0",
    rating: "0.0",
    ownerEmail: "support@vintagevault.shop",
    ownerPhone: "+44 20 7946 1188",
    location: "Birmingham, UK",
    category: "Vintage Apparel",
    monthlyOrders: "0",
    fulfillmentRate: "0%",
    returnRate: "0%",
    escalationRisk: "Medium",
  },
];

const statusStyles: Record<StoreStatus, string> = {
  Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Suspended: "bg-rose-50 text-rose-500 border-rose-100",
  Dormant: "bg-slate-50 text-slate-500 border-slate-200",
};

function ActionPill({
  icon: Icon,
  tone,
}: {
  icon: typeof CircleCheck;
  tone: "green" | "slate" | "rose";
}) {
  const toneStyles: Record<typeof tone, string> = {
    green: "border-emerald-200 text-emerald-500 hover:bg-emerald-50",
    slate: "border-slate-200 text-slate-500 hover:bg-slate-50",
    rose: "border-rose-200 text-rose-500 hover:bg-rose-50",
  };

  return (
    <button
      type="button"
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${toneStyles[tone]}`}
      aria-label="Store action"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export default function StoreManagementTable({
  rows = defaultRows,
  selectedStoreId,
  onSelectStore,
}: StoreManagementTableProps) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#d9e2e8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-[#e5edf1] bg-[#f8fbfc] px-3 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 rounded-2xl border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-600 shadow-sm md:w-auto md:rounded-full md:px-4">
          <Search className="h-4 w-4" />
          <span className="truncate">Search by Store Name, ID, or Owner...</span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button className="rounded-xl border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 sm:px-4" type="button">
            All Status
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white text-slate-600 transition hover:bg-slate-50" type="button" aria-label="Filter stores">
            <Filter className="h-4 w-4" />
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white text-slate-600 transition hover:bg-slate-50" type="button" aria-label="Download stores">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-[#edf2f5] md:hidden">
        {rows.map((row, index) => (
          <div
            key={`${row.id}-${index}`}
            className={`px-3 py-3 transition ${
              selectedStoreId === row.id ? "bg-cyan-50/40" : "hover:bg-slate-50"
            }`}
            onClick={() => onSelectStore?.(row)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectStore?.(row);
              }
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">{row.id}</p>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#dff2f5] text-xs font-bold text-[#4faebd]">
                    {row.name.charAt(0)}
                  </span>
                  <span>{row.name}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">Owner: {row.owner}</p>
                <p className="mt-0.5 text-xs text-slate-600">Onboarding: {row.onboarding}</p>
              </div>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[row.status]}`}>
                {row.status}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-600">Revenue: <span className="font-semibold text-slate-900">{row.revenue}</span></span>
              <span className="text-amber-500">{row.rating === "0.0" ? "n/a" : `★ ${row.rating}`}</span>
            </div>

            <div className="mt-2 flex items-center justify-end gap-2">
              {row.status === "Active" ? (
                <>
                  <ActionPill icon={CircleSlash} tone="slate" />
                  <ActionPill icon={PhoneCall} tone="green" />
                </>
              ) : row.status === "Suspended" ? (
                <>
                  <ActionPill icon={ShieldAlert} tone="rose" />
                  <ActionPill icon={PhoneCall} tone="slate" />
                </>
              ) : (
                <>
                  <ActionPill icon={CircleCheck} tone="green" />
                  <ActionPill icon={PhoneCall} tone="slate" />
                </>
              )}
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50" type="button" aria-label="More actions">
                <Ellipsis className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[1040px]">
          <div className="grid grid-cols-[0.9fr_1.6fr_1fr_1.4fr_1fr_1fr_0.8fr_0.8fr] border-b border-[#e7eef2] bg-[#fbfcfd] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            <div>Store ID</div>
            <div>Store Name</div>
            <div>Status</div>
            <div>Vendor/Owner</div>
            <div>Onboarding</div>
            <div>Revenue (30d)</div>
            <div>Rating</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-[#edf2f5]">
            {rows.map((row, index) => (
              <div
                key={`${row.id}-${index}`}
                className={`grid cursor-pointer grid-cols-[0.9fr_1.6fr_1fr_1.4fr_1fr_1fr_0.8fr_0.8fr] items-center px-5 py-4 text-sm text-slate-800 transition ${
                  selectedStoreId === row.id ? "bg-cyan-50/45" : "hover:bg-slate-50"
                }`}
                onClick={() => onSelectStore?.(row)}
              >
                <div className="font-semibold text-slate-600">{row.id}</div>
                <div className="flex items-center gap-3 font-semibold text-slate-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#dff2f5] text-xs font-bold text-[#4faebd]">
                    {row.name.charAt(0)}
                  </span>
                  <span>{row.name}</span>
                </div>
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}>
                    {row.status}
                  </span>
                </div>
                <div className="text-slate-700">{row.owner}</div>
                <div className="text-slate-700">{row.onboarding}</div>
                <div className="font-semibold text-slate-900">{row.revenue}</div>
                <div className="text-amber-500">{row.rating === "0.0" ? "n/a" : `★ ${row.rating}`}</div>
                <div className="flex items-center justify-end gap-2">
                  {row.status === "Active" ? (
                    <>
                      <ActionPill icon={CircleSlash} tone="slate" />
                      <ActionPill icon={PhoneCall} tone="green" />
                    </>
                  ) : row.status === "Suspended" ? (
                    <>
                      <ActionPill icon={ShieldAlert} tone="rose" />
                      <ActionPill icon={PhoneCall} tone="slate" />
                    </>
                  ) : (
                    <>
                      <ActionPill icon={CircleCheck} tone="green" />
                      <ActionPill icon={PhoneCall} tone="slate" />
                    </>
                  )}
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50" type="button" aria-label="More actions">
                    <Ellipsis className="h-4 w-4" />
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
