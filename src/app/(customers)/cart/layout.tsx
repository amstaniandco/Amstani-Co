import type { ReactNode } from "react";

export default function CartLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto p-8">{children}</main>
    </div>
  );
}
