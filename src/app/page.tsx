import Header from "../components/pages/Header";
import Footer from "../components/pages/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-5xl p-8">
        <section className="rounded-xl bg-white p-10 shadow-md">
          <h1 className="text-4xl font-bold">Landing Page</h1>
          <p className="mt-4 text-lg text-slate-600">
            Welcome to Amstani Co. This is the public entry page for the app.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Use the navigation bar to go to role-specific pages.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
