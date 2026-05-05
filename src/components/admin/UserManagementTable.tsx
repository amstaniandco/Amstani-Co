"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, Filter, Download, ChevronUp, ChevronDown,
  Trash2, ShieldCheck, UserRound, Store, Users,
  UserPlus, Check, X, AlertTriangle,
} from "lucide-react";

type Role = "user" | "owner" | "admin";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  state: string;
  phone: string;
  avatarUrl: string;
  createdAt: string | null;
}

interface Stats {
  total: number;
  users: number;
  owners: number;
  admins: number;
  newThisMonth: number;
}

type SortField = "name" | "email" | "role" | "date";

const roleBadge: Record<Role, string> = {
  user:  "bg-slate-100 text-slate-600 border-slate-200",
  owner: "bg-cyan-50 text-cyan-700 border-cyan-200",
  admin: "bg-rose-50 text-rose-600 border-rose-200",
};

const roleIcon: Record<Role, typeof UserRound> = {
  user:  UserRound,
  owner: Store,
  admin: ShieldCheck,
};

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[#dbe5eb] bg-white px-5 py-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_1.6fr_0.9fr_0.8fr_0.9fr_0.7fr] items-center gap-4 px-5 py-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-slate-100" />
        <div className="h-4 w-28 rounded bg-slate-100" />
      </div>
      <div className="h-4 w-40 rounded bg-slate-100" />
      <div className="h-6 w-16 rounded-full bg-slate-100" />
      <div className="h-4 w-20 rounded bg-slate-100" />
      <div className="h-4 w-24 rounded bg-slate-100" />
      <div className="flex justify-end gap-2">
        <div className="h-8 w-8 rounded-full bg-slate-100" />
        <div className="h-8 w-8 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-50">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Are you sure?</p>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagementTable() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, users: 0, owners: 0, admins: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");

  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role>("user");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to load users"); return; }
      setUsers(data.users);
      setStats(data.stats);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers, search]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortOrder("asc"); }
  };

  const sorted = [...users].sort((a, b) => {
    let v = 0;
    if (sortBy === "name") v = a.name.localeCompare(b.name);
    else if (sortBy === "email") v = a.email.localeCompare(b.email);
    else if (sortBy === "role") v = a.role.localeCompare(b.role);
    else if (sortBy === "date") v = new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
    return sortOrder === "asc" ? v : -v;
  });

  const handleSaveRole = async (userId: string) => {
    setSavingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole: pendingRole }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update role"); return; }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: pendingRole } : u));
      setEditingId(null);
    } catch {
      setError("Failed to update role");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete user"); return; }
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setStats((s) => ({ ...s, total: s.total - 1, [deleteTarget.role + "s"]: Math.max(0, (s as any)[deleteTarget.role + "s"] - 1) }));
    } catch {
      setError("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc"
      ? <ChevronUp className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3" />;
  };

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const avatarColors = ["bg-cyan-100 text-cyan-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-600"];
  const avatarColor = (id: string) => avatarColors[id.charCodeAt(id.length - 1) % avatarColors.length];

  return (
    <div className="space-y-5">
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Regular Users" value={stats.users} />
        <StatCard label="Store Owners" value={stats.owners} />
        <StatCard label="New This Month" value={stats.newThisMonth} sub={`${stats.admins} admin${stats.admins !== 1 ? "s" : ""}`} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-[22px] border border-[#dbe5eb] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[#e5edf1] bg-[#f8fbfc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full items-center gap-2 rounded-2xl border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-600 shadow-sm sm:w-72 sm:rounded-full sm:px-4">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
              className="rounded-xl border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="owner">Owners</option>
              <option value="admin">Admins</option>
            </select>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white text-slate-500 transition hover:bg-slate-50"
              aria-label="Filter"
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white text-slate-500 transition hover:bg-slate-50"
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[860px]">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_1.6fr_0.9fr_0.8fr_0.9fr_0.7fr] gap-4 border-b border-[#e7eef2] bg-[#fbfcfd] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {(["name", "email", "role", "state", "date"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleSort(f === "date" ? "date" : f as SortField)}
                  className="flex items-center gap-1 text-left transition hover:text-slate-700"
                >
                  {f === "date" ? "Joined" : f.charAt(0).toUpperCase() + f.slice(1)}
                  <SortIcon field={f === "date" ? "date" : f as SortField} />
                </button>
              ))}
              <div className="text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#edf2f5]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : sorted.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                  <Users className="h-10 w-10" />
                  <p className="text-sm font-medium">No users found</p>
                </div>
              ) : (
                sorted.map((user) => {
                  const RoleIcon = roleIcon[user.role];
                  const isEditing = editingId === user.id;
                  const isDeleting = deletingId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`grid grid-cols-[1fr_1.6fr_0.9fr_0.8fr_0.9fr_0.7fr] items-center gap-4 px-5 py-3.5 text-sm transition ${isDeleting ? "opacity-40 pointer-events-none" : "hover:bg-slate-50/60"}`}
                    >
                      {/* Name + avatar */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(user.id)}`}>
                          {user.avatarUrl
                            ? <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                            : initials(user.name)}
                        </div>
                        <span className="truncate font-medium text-slate-900">{user.name}</span>
                      </div>

                      {/* Email */}
                      <span className="truncate text-slate-600">{user.email}</span>

                      {/* Role */}
                      <div>
                        {isEditing ? (
                          <select
                            value={pendingRole}
                            onChange={(e) => setPendingRole(e.target.value as Role)}
                            className="rounded-lg border border-[#d8e3e8] bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-cyan-400"
                          >
                            <option value="user">User</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleBadge[user.role]}`}>
                            <RoleIcon className="h-3 w-3" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        )}
                      </div>

                      {/* State */}
                      <span className="truncate text-slate-500 text-xs">{user.state || "—"}</span>

                      {/* Joined */}
                      <span className="text-slate-500 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              disabled={savingId === user.id}
                              onClick={() => handleSaveRole(user.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                              title="Save"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => { setEditingId(user.id); setPendingRole(user.role); }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8e3e8] text-slate-500 transition hover:bg-slate-50"
                              title="Change role"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 text-rose-400 transition hover:bg-rose-50"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-[#edf2f5] md:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse px-4 py-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-slate-100" />
                    <div className="h-3 w-40 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
              <Users className="h-8 w-8" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            sorted.map((user) => {
              const RoleIcon = roleIcon[user.role];
              const isEditing = editingId === user.id;
              return (
                <div key={user.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(user.id)}`}>
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                          : initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{user.name}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleBadge[user.role]}`}>
                      <RoleIcon className="h-3 w-3" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{user.state || "No state"}</span>
                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
                  </div>

                  {isEditing ? (
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={pendingRole}
                        onChange={(e) => setPendingRole(e.target.value as Role)}
                        className="flex-1 rounded-lg border border-[#d8e3e8] px-2 py-1.5 text-sm outline-none"
                      >
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => handleSaveRole(user.id)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">Save</button>
                      <button onClick={() => setEditingId(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => { setEditingId(user.id); setPendingRole(user.role); }}
                        className="flex-1 rounded-xl border border-[#d8e3e8] py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="rounded-xl border border-rose-100 px-3 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {!loading && sorted.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#e7eef2] bg-[#fbfcfd] px-5 py-3 text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{sorted.length}</span> of{" "}
              <span className="font-semibold text-slate-700">{stats.total}</span> users
            </span>
            <span className="flex items-center gap-1">
              <UserPlus className="h-3.5 w-3.5 text-cyan-500" />
              {stats.newThisMonth} new this month
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
