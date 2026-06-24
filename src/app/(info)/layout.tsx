import type { ReactNode } from "react";
import Header from "../../components/pages/Header";
import Footer from "../../components/pages/Footer";

export default function InfoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</main>
      <Footer />
    </>
  );
}
