import type { ReactNode } from "react";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <main className="mx-auto p-4 max-w-screen-lg">{children}</main>
    </div>
  );
}
