"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b bg-white p-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-xl font-bold">Amstani Co Full Stack App</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/">Landing</Link>
          <Link href="/home">Home</Link>
          <Link href="/store">Store</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/user">User</Link>
        </nav>
      </div>
    </header>
  );
}
