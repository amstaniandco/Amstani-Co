import type { ReactNode } from "react";

export default function ClaimsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <main className="mx-auto p-2 max-w-screen-xl">{children}</main>
    </div>
  );
}
