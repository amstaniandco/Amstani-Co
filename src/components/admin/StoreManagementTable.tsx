"use client";

import { CircleCheck, CircleSlash, Download, Ellipsis, Filter, PhoneCall, Search, ShieldAlert, Package, Trash2, Eye, Mail } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  onSuspend?: (storeId: string) => void;
  onActivate?: (storeId: string) => void;
  onContact?: (storeId: string) => void;
  onMoreActions?: (storeId: string) => void;
  onManageProducts?: (storeId: string) => void;
  onDeleteStore?: (storeId: string) => void;
  onViewAnalytics?: (storeId: string) => void;
  onViewStore?: (storeId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: "all" | "Active" | "Suspended" | "Dormant";
  onStatusFilterChange?: (status: "all" | "Active" | "Suspended" | "Dormant") => void;
  stateFilter?: string;
  onStateFilterChange?: (state: string) => void;
  availableStates?: string[];
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
  onClick,
}: {
  icon: typeof CircleCheck;
  tone: "green" | "slate" | "rose";
  onClick?: () => void;
}) {
  const toneStyles: Record<typeof tone, string> = {
    green: "border-emerald-200 text-emerald-500 hover:bg-emerald-50",
    slate: "border-slate-200 text-slate-500 hover:bg-slate-50",
    rose: "border-rose-200 text-rose-500 hover:bg-rose-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
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
  onSuspend,
  onActivate,
  onContact,
  onMoreActions,
  onManageProducts,
  onDeleteStore,
  onViewAnalytics,
  onViewStore,
  searchQuery = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  stateFilter = "all",
  onStateFilterChange,
  availableStates = [],
}: StoreManagementTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#d9e2e8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-[#e5edf1] bg-[#f8fbfc] p-3 sm:p-5">
        {/* Search and Filters Row 1 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 rounded-2xl border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-600 shadow-sm md:w-auto md:flex-1 md:rounded-lg md:px-4">
            <Search className="h-4 w-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by Store Name, ID, or Owner..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Download Button */}
          <button className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#d8e3e8] bg-white text-slate-600 transition hover:bg-slate-50" type="button" aria-label="Download stores">
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Filters Row 2 */}
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange?.(e.target.value as "all" | "Active" | "Suspended" | "Dormant")}
            className="rounded-lg border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Dormant">Dormant</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => onStateFilterChange?.(e.target.value)}
            className="rounded-lg border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50"
          >
            <option value="all">All States</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== "all" || stateFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                onSearchChange?.("");
                onStatusFilterChange?.("all");
                onStateFilterChange?.("all");
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          )}
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
                  <ActionPill 
                    icon={CircleSlash} 
                    tone="slate"
                    onClick={() => onSuspend?.(row.id)}
                  />
                  <ActionPill 
                    icon={PhoneCall} 
                    tone="green"
                    onClick={() => onContact?.(row.id)}
                  />
                </>
              ) : row.status === "Suspended" ? (
                <>
                  <ActionPill 
                    icon={ShieldAlert} 
                    tone="rose"
                    onClick={() => onActivate?.(row.id)}
                  />
                  <ActionPill 
                    icon={PhoneCall} 
                    tone="slate"
                    onClick={() => onContact?.(row.id)}
                  />
                </>
              ) : (
                <>
                  <ActionPill 
                    icon={CircleCheck} 
                    tone="green"
                    onClick={() => onActivate?.(row.id)}
                  />
                  <ActionPill 
                    icon={PhoneCall} 
                    tone="slate"
                    onClick={() => onContact?.(row.id)}
                  />
                </>
              )}
              <div className="relative" ref={menuRef}>
                <button 
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50" 
                  type="button" 
                  onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                  aria-label="More actions"
                >
                  <Ellipsis className="h-4 w-4" />
                </button>

                {openMenuId === row.id && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-[#e5edf1] bg-white shadow-lg z-50">
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => {
                          onManageProducts?.(row.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <Package className="h-4 w-4" />
                        Manage Products
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onViewAnalytics?.(row.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Analytics
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onViewStore?.(row.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <Mail className="h-4 w-4" />
                        Contact Owner
                      </button>

                      <div className="my-1 border-t border-[#e5edf1]" />

                      <button
                        type="button"
                        onClick={() => {
                          onDeleteStore?.(row.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Store
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                      <ActionPill 
                        icon={CircleSlash} 
                        tone="slate"
                        onClick={() => onSuspend?.(row.id)}
                      />
                      <ActionPill 
                        icon={PhoneCall} 
                        tone="green"
                        onClick={() => onContact?.(row.id)}
                      />
                    </>
                  ) : row.status === "Suspended" ? (
                    <>
                      <ActionPill 
                        icon={ShieldAlert} 
                        tone="rose"
                        onClick={() => onActivate?.(row.id)}
                      />
                      <ActionPill 
                        icon={PhoneCall} 
                        tone="slate"
                        onClick={() => onContact?.(row.id)}
                      />
                    </>
                  ) : (
                    <>
                      <ActionPill 
                        icon={CircleCheck} 
                        tone="green"
                        onClick={() => onActivate?.(row.id)}
                      />
                      <ActionPill 
                        icon={PhoneCall} 
                        tone="slate"
                        onClick={() => onContact?.(row.id)}
                      />
                    </>
                  )}
                  <div className="relative" ref={menuRef}>
                    <button 
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50" 
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                      aria-label="More actions"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </button>

                    {openMenuId === row.id && (
                      <div className="fixed right-4 top-auto rounded-lg border border-[#e5edf1] bg-white shadow-xl" style={{ zIndex: 9999, minWidth: '200px' }}>
                        <div className="p-1">
                          <button
                            type="button"
                            onClick={() => {
                              onManageProducts?.(row.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <Package className="h-4 w-4" />
                            Manage Products
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onContact?.(row.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <Mail className="h-4 w-4" />
                            Contact Owner
                          </button>

                          <div className="my-1 border-t border-[#e5edf1]" />

                          <button
                            type="button"
                            onClick={() => {
                              onDeleteStore?.(row.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Store
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
