"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountActions({ onDeleteAccount }: { onDeleteAccount: () => Promise<void> }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
      router.refresh();
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account? This will remove your saved profile details, cards, addresses, cart, and wishlist.")) return;

    setDeleting(true);
    try {
      await onDeleteAccount();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/signup");
      router.refresh();
    } catch (error) {
      console.error("Error deleting account:", error);
      setDeleting(false);
    }
  };

  return (
    <section className="ui-panel mt-4 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-rose-500/50 dark:text-rose-300 dark:hover:bg-rose-900/20"
        >
          Logout
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="w-full rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-900/20"
        >
          {deleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </section>
  );
}
