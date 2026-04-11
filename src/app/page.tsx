import Header from "../components/pages/Header";
import Footer from "../components/pages/Footer";
import LandingPage from "./landing/page";
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-5xl p-8">
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
}
