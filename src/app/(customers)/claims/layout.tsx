import type { ReactNode } from "react";
import Header from "../../../components/pages/Header";
import Footer from "../../../components/pages/Footer";

export default function ClaimsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto p-8 max-w-screen-xl">{children}</main>
      <Footer />
    </div>
  );
}
