import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";
import { Pencil, Slash, Upload } from "lucide-react";
import { defaultRows } from "../../../../../components/admin/StoreManagementTable";

type PromotedStore = {
  id: number;
  name: string;
  email: string;
  state: string;
  endDate: string;
};

function getStoreName(storeId?: string) {
  return defaultRows.find((store: { id: string }) => store.id === storeId)?.name ?? "Name of Store";
}

export default function AdminStorePromotePage({ searchParams }: { searchParams?: { storeId?: string } }) {
  const storeId = searchParams?.storeId;
  const storeName = getStoreName(storeId);

  const promotedStores: PromotedStore[] = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    name: "Store Name",
    email: "name@gmail.com",
    state: "LA",
    endDate: "02/12/2026",
  }));

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/stores" />

        <main className="rounded-xl border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:rounded-[28px] sm:p-3 md:p-4">
          <AdminNavbar />

          <section className="mt-3 rounded-[28px] border border-[#d9e2e8] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{storeName}</h1>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Store Card Media</p>
                <button
                  type="button"
                  className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </button>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">End Date</p>
                <input
                  type="date"
                  defaultValue="2026-12-02"
                  className="mt-3 h-14 w-full rounded-3xl border border-[#d9e2e8] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-3xl bg-[#5dc7d6] px-5 text-sm font-semibold text-white transition hover:bg-[#4bb2c1]"
            >
              Promote
            </button>
          </section>

          <section className="mt-4 rounded-[28px] border border-[#d9e2e8] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Promoted Stores</h2>
              </div>
            </div>
            <div className="overflow-x-auto rounded-[22px] border border-[#e5edf1] bg-[#fbfcfd]">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-white text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">State</th>
                    <th className="px-4 py-4">End Date</th>
                    <th className="px-4 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
                  {promotedStores.map((store, index) => (
                    <tr key={store.id} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
                      <td className="px-4 py-4 font-semibold text-slate-900">{store.name}</td>
                      <td className="px-4 py-4 text-slate-600">{store.email}</td>
                      <td className="px-4 py-4 text-slate-600">{store.state}</td>
                      <td className="px-4 py-4 text-slate-600">{store.endDate}</td>
                      <td className="px-4 py-4 text-slate-700">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white text-slate-600 transition hover:bg-slate-50"
                            aria-label="Edit promoted store"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#f1d3d8] bg-[#fff3f5] text-[#b91c1c] transition hover:bg-[#fee2e2]"
                            aria-label="Remove promoted store"
                          >
                            <Slash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
