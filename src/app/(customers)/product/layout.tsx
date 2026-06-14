import type { ReactNode } from "react";

export default function ProductLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b1220] dark:text-slate-100">
      <main>{children}</main>
    </div>
  );
}
