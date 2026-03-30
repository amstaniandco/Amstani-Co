"use client";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white p-4 text-center text-sm text-zinc-500">
      Built with Next.js — © {new Date().getFullYear()} Amstani Co
    </footer>
  );
}
