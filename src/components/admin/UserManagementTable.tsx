"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit2, ChevronUp, ChevronDown } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "owner" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  users: User[];
  error?: string;
}

export default function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"user" | "owner" | "admin">("user");
  const [sortBy, setSortBy] = useState<"name" | "email" | "role" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load users");
        setLoading(false);
        return;
      }

      setUsers(data.users);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: "user" | "owner" | "admin") => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole: role }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update role");
        return;
      }

      const data = await response.json();
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, role: data.user.role } : u
        )
      );
      setEditingId(null);
      setError("");
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete user");
        return;
      }

      setUsers(users.filter((u) => u.id !== userId));
      setError("");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
    }
  };

  const getSortedUsers = () => {
    const sorted = [...users].sort((a, b) => {
      let compareValue = 0;

      if (sortBy === "name") {
        compareValue = a.name.localeCompare(b.name);
      } else if (sortBy === "email") {
        compareValue = a.email.localeCompare(b.email);
      } else if (sortBy === "role") {
        compareValue = a.role.localeCompare(b.role);
      } else if (sortBy === "date") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        compareValue = dateA - dateB;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  };

  const handleSort = (field: "name" | "email" | "role" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
                >
                  Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
                >
                  Email
                  <SortIcon field="email" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("role")}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
                >
                  Role
                  <SortIcon field="role" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:bg-gray-100 px-2 py-1 rounded"
                >
                  Created
                  <SortIcon field="date" />
                </button>
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {getSortedUsers().length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              getSortedUsers().map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <select
                        value={newRole}
                        onChange={(e) =>
                          setNewRole(e.target.value as "user" | "owner" | "admin")
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "owner"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateRole(user.id, newRole)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(user.id);
                              setNewRole(user.role);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit user role"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-600">
        Total users: {users.length}
      </div>
    </div>
  );
}
