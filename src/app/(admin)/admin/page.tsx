import AdminNavbar from "../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../components/admin/AdminSidebar";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin" />

        <main>
          <AdminNavbar searchPlaceholder="Search stores, staff, and incidents..." />

          <section className="mt-4 rounded-3xl border border-[#dbe5eb] bg-white/80 p-10 shadow-[0_16px_30px_rgba(15,23,42,0.07)]">
            <h1 className="text-4xl font-bold text-slate-800">Admin Home</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              This route now reuses the same sidebar and navbar components used by the dashboard page.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
