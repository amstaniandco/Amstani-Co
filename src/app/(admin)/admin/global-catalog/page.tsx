import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import GlobalCatalogTable from "../../../../components/admin/GlobalCatalogTable";
import Link from "next/link";

export default function AdminGlobalCatalogPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/global-catalog" />

        <main className="rounded-xl md:rounded-[28px] border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-3 md:p-4">
          <AdminNavbar />

          <section className="mt-3 rounded-xl md:rounded-[26px] bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-3 border-b border-[#e7edf1] pb-3 sm:gap-4 sm:pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[26px]">Global Catalog & System Admin</h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">Manage master data, tax rules, and pricing constraints for all customers.</p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6ec0c9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5db1bb] sm:px-4 sm:py-2.5 sm:text-sm md:rounded-xl"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Global Product
              </button>
            </div>

            <div className="mt-3 flex gap-4 border-b border-[#e7edf1] text-xs font-semibold text-slate-700 sm:gap-6 sm:text-sm">
              <Link
                href="/admin/global-catalog"
                className="border-b-2 border-[#58b8c3] pb-2 text-[#2f7f8d] sm:pb-3"
              >
                Products
              </Link>
              <Link
                href="/admin/global-catalog/tax-pricing"
                className="border-b-2 border-transparent pb-2 text-slate-500 transition hover:text-slate-700 sm:pb-3"
              >
                Tax & Pricing
              </Link>
            </div>
          </section>

          <section className="mt-3 md:mt-4">
            <GlobalCatalogTable />
          </section>
        </main>
      </div>
    </div>
  );
}
