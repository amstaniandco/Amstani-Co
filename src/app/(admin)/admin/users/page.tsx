import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import UserManagementTable from "../../../../components/admin/UserManagementTable";

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/users" />

        <main>
          <AdminNavbar searchPlaceholder="Search users by name or email..." />

          <section className="mt-4 rounded-3xl border border-[#dbe5eb] bg-white/80 p-10 shadow-[0_16px_30px_rgba(15,23,42,0.07)]">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-800">User Management</h1>
              <p className="mt-2 text-slate-600">
                Manage user accounts and assign roles
              </p>
            </div>

            <UserManagementTable />
          </section>
        </main>
      </div>
    </div>
  );
}
