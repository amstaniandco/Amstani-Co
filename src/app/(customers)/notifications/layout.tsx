import type { ReactNode } from "react";

export default function NotificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b1220] dark:text-slate-100">
      <main className="mx-auto p-2">{children}</main>
    </div>
  );
}
