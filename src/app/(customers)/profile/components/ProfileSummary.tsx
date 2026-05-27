"use client";

import { useState, useEffect } from "react";
import { User } from "../../../../models/user";

type ProfileFormData = Pick<User, "name" | "email" | "phone" | "state">;

export default function ProfileSummary({ user, onSave }: { user: User | null; onSave: (data: ProfileFormData) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        state: user.state || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const avatarFallback = formData.name ? formData.name.charAt(0).toUpperCase() : "U";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      state: user?.state || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  return (
    <aside className="ui-panel rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-800 md:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">{avatarFallback}</span>
            )}
            <div className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-white shadow-md cursor-pointer hover:bg-cyan-500">
              E
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{formData.name || "User"}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{formData.email}</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 px-4 py-2 rounded-lg bg-cyan-400 text-white text-sm font-semibold hover:bg-cyan-500 transition flex-shrink-0"
          >
            Edit
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Full Name {isEditing && <span className="text-red-500">*</span>}
          </label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            readOnly={!isEditing}
            placeholder="Enter your name"
            className={`ui-input mt-1 w-full rounded-lg border px-3 py-2 text-sm transition ${
              isEditing
                ? "border-cyan-400 bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">State</label>
          <input
            name="state"
            type="text"
            value={formData.state}
            onChange={handleChange}
            readOnly={!isEditing}
            placeholder="Enter your state"
            className={`ui-input mt-1 w-full rounded-lg border px-3 py-2 text-sm transition ${
              isEditing
                ? "border-cyan-400 bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Email Address {isEditing && <span className="text-red-500">*</span>}
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!isEditing}
            placeholder="Enter your email"
            className={`ui-input mt-1 w-full rounded-lg border px-3 py-2 text-sm transition ${
              isEditing
                ? "border-cyan-400 bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phone Number</label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            readOnly={!isEditing}
            placeholder="Enter your phone number"
            className={`ui-input mt-1 w-full rounded-lg border px-3 py-2 text-sm transition ${
              isEditing
                ? "border-cyan-400 bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }`}
          />
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name || !formData.email}
            className="px-4 py-2 rounded-lg bg-cyan-400 text-white font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </aside>
  );
}
