import Header from "../components/pages/Header";
import Footer from "../components/pages/Footer";
import CustomerHomePage from "./(customers)/home/page";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <CustomerHomePage />
      </main>
      <Footer />
    </div>
  );
}
