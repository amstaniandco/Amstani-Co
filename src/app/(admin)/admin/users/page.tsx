import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import UserManagementTable from "../../../../components/admin/UserManagementTable";

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/users" />

        <main className="flex flex-col gap-4">
          <AdminNavbar searchPlaceholder="Search users by name or email..." />

          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">Manage accounts, assign roles, and remove users.</p>
          </div>

          <UserManagementTable />
        </main>
      </div>
    </div>
  );
}
