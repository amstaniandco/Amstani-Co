import type { ReactNode } from "react";

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <main className="mx-auto max-w-7xl p-8">{children}</main>
    </div>
  );
}
