import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f1f5f6] text-slate-900">
      <main>{children}</main>
    </div>
  );
}
