"use client";

import { useRouter } from "next/navigation";
import { clearDemoSession } from "@/src/lib/auth/demoAuth";

export default function AccountActions() {
  const router = useRouter();

  const handleLogout = () => {
    clearDemoSession();
    router.push("/login");
  };

  return (
    <section className="mt-4 rounded-2xl bg-white p-6 shadow-xl">
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
        <button type="button" className="w-full rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50">
          Delete Account
        </button>
      </div>
    </section>
  );
}
