"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/global/ToastProvider";

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      d="M16.5 8H14.25C13.836 8 13.5 8.336 13.5 8.75V11H16.5L16.05 14H13.5V22H10.5V14H8.5V11H10.5V8.75C10.5 6.679 12.179 5 14.25 5H16.5V8Z"
      fill="white"
    />
  </svg>
);

const XIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
      fill="currentColor"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error === "oauth_failed") {
      toast.error("OAuth sign in failed. Please try again.");
    } else if (error === "oauth_not_configured") {
      toast.error("OAuth is not configured. Please use email login.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      // Redirect based on role
      const role = data.user.role;
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "owner") {
        router.push("/owner/profile");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#f7f7f7] dark:bg-[#0b1220]">
      <div className="hidden md:block w-1/2 relative">
        <Image
          src="/assets/AmstaniCover.png"
          alt="Amstani & Co cover"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[500px]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-black transition-colors duration-150 hover:text-[#6FAFB3] dark:text-slate-200"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>

          <div className="mb-10 text-center">
            <h1 className="text-[40px] leading-tight font-extrabold tracking-tight text-black dark:text-slate-100">
              Welcome Back
            </h1>
          </div>

          <div className="space-y-5">
            <button
              type="button"
              onClick={() => { window.location.href = "/api/auth/google"; }}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-[16px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => { window.location.href = "/api/auth/facebook"; }}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-[16px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]"
            >
              <FacebookIcon />
              <span>Continue with Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => { window.location.href = "/api/auth/twitter"; }}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-[16px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]"
            >
              <XIcon />
              <span>Continue with X</span>
            </button>
          </div>

          <div className="my-7 flex items-center gap-3 text-[#7a7a7a] dark:text-slate-400">
            <div className="ui-divider h-px flex-1 bg-[#9f9f9f]" />
            <span className="text-xs">or</span>
            <div className="ui-divider h-px flex-1 bg-[#9f9f9f]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-black dark:text-slate-200">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Email"
                className="ui-input mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none disabled:bg-gray-100 dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>

            <label className="block">
              <span className="text-sm text-black dark:text-slate-200">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Password"
                className="ui-input mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none disabled:bg-gray-100 dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-[#6FAFB3] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#619da1] disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-[15px] text-black/80 dark:text-slate-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#6FAFB3] hover:text-[#5b9ca1]"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
