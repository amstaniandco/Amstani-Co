import type { ReactNode } from "react";
import Header from "../../components/pages/Header";
import Footer from "../../components/pages/Footer";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-5xl p-8">{children}</main>
      <Footer />
    </div>
  );
}
