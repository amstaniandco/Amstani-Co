import { fetchUsers } from "./services/userService";
import Header from "./components/Header";
import Footer from "./components/Footer";
import UserList from "./components/UserList";

export default async function Home() {
  const users = await fetchUsers();

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <Header />
      <main className="mx-auto max-w-6xl p-6">
        <h2 className="mb-4 text-2xl font-semibold">Users</h2>
        <p className="mb-6 text-sm text-zinc-600">
          This is a full-stack Next.js example with API route and shared service layer.
        </p>

        <UserList users={users} />
      </main>
      <Footer />
    </div>
  );
}
