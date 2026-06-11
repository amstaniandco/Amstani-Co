import { Suspense } from "react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import UserManagementTable from "../../../../components/admin/UserManagementTable";

export default function UserManagementPage() {
  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/users" className="admin-sidebar-flush" />

        <main className="admin-main-scroll flex flex-col gap-4">
          <AdminNavbar searchPlaceholder="Search users by name or email..." />

          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">Manage accounts, assign roles, and remove users.</p>
          </div>

          <Suspense fallback={null}>
            <UserManagementTable />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
