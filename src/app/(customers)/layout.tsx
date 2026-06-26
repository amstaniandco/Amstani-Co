import { Suspense, type ReactNode } from "react";
import Header from "../../components/pages/Header";
import Footer from "../../components/pages/Footer";
import StoreMusicPlayer from "./store/StoreMusicPlayer";

export default function CustomersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <Suspense>
        <StoreMusicPlayer />
      </Suspense>
    </>
  );
}
