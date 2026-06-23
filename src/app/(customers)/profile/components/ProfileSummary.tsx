"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { User } from "../../../../models/user";

type ProfileFormData = Pick<User, "name" | "email" | "phone" | "state"> & Partial<Pick<User, "avatarUrl">>;

export default function ProfileSummary({
  user,
  onSave,
  onAvatarUpload,
}: {
  user: User | null;
  onSave: (data: ProfileFormData) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<string>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = user?.avatarUrl || "";
      if (pendingAvatarFile) {
        setIsUploadingAvatar(true);
        avatarUrl = await onAvatarUpload(pendingAvatarFile);
      }

      await onSave(avatarUrl ? { ...formData, avatarUrl } : formData);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl("");
      setPendingAvatarFile(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsUploadingAvatar(false);
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isEditing) return;

    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setPendingAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      state: user?.state || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setPendingAvatarFile(null);
    setAvatarPreviewUrl("");
    setIsEditing(false);
  };

  const displayedAvatarUrl = avatarPreviewUrl || user?.avatarUrl || "";

  const connectedAccounts = [
    { key: "google", label: "Google", linked: Boolean(user?.googleId), dotClass: "bg-red-500" },
    { key: "facebook", label: "Facebook", linked: Boolean(user?.facebookId), dotClass: "bg-blue-600" },
    { key: "twitter", label: "X (Twitter)", linked: Boolean(user?.twitterId), dotClass: "bg-slate-900 dark:bg-slate-100" },
  ].filter((account) => account.linked);

  return (
    <aside className="ui-panel rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-800 md:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative h-24 w-24 flex-shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-md dark:bg-slate-700 flex items-center justify-center">
              {displayedAvatarUrl ? (
                <img
                  src={displayedAvatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">{avatarFallback}</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isEditing || isUploadingAvatar || isSaving}
              aria-label="Upload profile photo"
              title={isEditing ? "Choose profile photo" : "Click Edit to change photo"}
              className="absolute left-14 top-14 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-white shadow-md transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingAvatar ? "..." : <Pencil className="h-4 w-4" aria-hidden="true" />}
            </button>
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

        {connectedAccounts.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Connected Accounts</label>
            <div className="mt-2 space-y-2">
              {connectedAccounts.map((account) => (
                <div
                  key={account.key}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${account.dotClass}`} aria-hidden="true" />
                    <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{account.label}</span>
                  </span>
                  <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    Linked
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
            disabled={isSaving || isUploadingAvatar || !formData.name || !formData.email}
            className="px-4 py-2 rounded-lg bg-cyan-400 text-white font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
          >
            {isUploadingAvatar ? "Uploading..." : isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </aside>
  );
}
