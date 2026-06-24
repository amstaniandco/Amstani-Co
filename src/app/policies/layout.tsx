import type { ReactNode } from "react";
import Header from "../../components/pages/Header";
import Footer from "../../components/pages/Footer";

export default function PoliciesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
