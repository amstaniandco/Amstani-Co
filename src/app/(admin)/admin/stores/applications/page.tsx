"use client";

import { useState } from "react";
import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";
import StoreApplicationsTables from "../../../../../components/admin/StoreApplicationsTable";
import Link from "next/link";

export default function AdminStoreApplicationsPage() {
  const [isAccepting, setIsAccepting] = useState(true);

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/stores" />

        <main className="rounded-xl md:rounded-[28px] border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-3 md:p-4">
          <AdminNavbar />

          <section className="mt-3 rounded-xl md:rounded-[26px] bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-3 border-b border-[#e7edf1] pb-3 sm:gap-4 sm:pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[26px]">
                  Store Management
                </h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Oversee multi-vendor operations and performance metrics.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6ec0c9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5db1bb] sm:px-4 sm:py-2.5 sm:text-sm md:rounded-xl"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Register New Store
              </button>
            </div>

            <div className="mt-3 flex gap-4 border-b border-[#e7edf1] text-xs font-semibold text-slate-700 sm:gap-6 sm:text-sm">
              <Link
                href="/admin/stores"
                className="border-b-2 border-transparent pb-2 text-slate-500 transition hover:text-slate-700 sm:pb-3"
              >
                All Stores
              </Link>
              <Link
                href="/admin/stores/applications"
                className="border-b-2 border-[#58b8c3] pb-2 text-[#2f7f8d] sm:pb-3"
              >
                Store Applications
              </Link>
              <Link
                href="/admin/stores/signup-requests"
                className="border-b-2 border-transparent pb-2 text-slate-500 transition hover:text-slate-700 sm:pb-3"
              >
                Signup Requests
              </Link>
            </div>
          </section>

          <section className="mt-3 md:mt-4">
            <div className="mb-3 flex flex-row items-end justify-between px-1 text-xs text-slate-600 sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
              <div>
                <span className="mr-2">Monthly limit</span>
                <input type="number" className="border w-[50px] rounded" />
              </div>
              <div className="flex items-center gap-2">
                <span>Accepting applications</span>
                <button
                  onClick={() => setIsAccepting(!isAccepting)}
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAccepting ? "bg-[#58b8c3]" : "bg-[#c7d2d9]"
                  }`}
                  aria-label="Accepting applications toggle"
                >
                  <span
                    className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                      isAccepting ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <StoreApplicationsTables />
          </section>
        </main>
      </div>
    </div>
  );
}
