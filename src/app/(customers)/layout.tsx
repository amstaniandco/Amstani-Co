import type { ReactNode } from "react";
import Header from "../../components/pages/Header";
import Footer from "../../components/pages/Footer";

export default function CustomersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
