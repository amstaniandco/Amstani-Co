import type { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full text-slate-900">
      <main className="mx-auto p-2 max-w-screen-xxl">{children}</main>
    </div>
  );
}
