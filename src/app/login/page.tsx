"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

const AppleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.15.77 1.2-.24 2.35-.93 3.63-.84 1.54.12 2.7.72 3.46 1.86-3.14 1.88-2.39 5.98.48 7.13-.57 1.39-1.32 2.76-2.72 3.96zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const DuckDuckGoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#DE5833" />
    <circle cx="12" cy="11" r="6" fill="#F5F0EB" />
    <circle cx="10.5" cy="9.5" r="1.5" fill="#1D1D1B" />
    <circle cx="10.9" cy="9.2" r="0.5" fill="white" />
    <path
      d="M9 13 Q12 15 15 13"
      stroke="#DE5833"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M12 5 Q14 3 16 5"
      stroke="#F5C842"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Logging in", { email, password });
  };

  return (
    <main className="min-h-screen flex bg-[#f7f7f7]">
      <div className="hidden md:block w-1/2 relative">
        <Image
          src="/assets/AmstaniCover.png"
          alt="Amstani & Co cover"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute top-10 left-10 text-white">
          <div className="text-2xl font-semibold tracking-wide">AMSTANI & CO</div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[380px] relative">
          <div className="rounded-2xl bg-transparent p-2">
            <div className="mb-8 text-center">
              <h1 className="text-[36px] leading-tight font-extrabold tracking-tight text-black">
                Welcome Back
              </h1>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-black bg-white text-black text-[14px] font-medium hover:bg-gray-50 transition-colors duration-150"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-black bg-white text-black text-[14px] font-medium hover:bg-gray-50 transition-colors duration-150"
              >
                <AppleIcon />
                <span>Continue with Apple</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-black bg-white text-black text-[14px] font-medium hover:bg-gray-50 transition-colors duration-150"
              >
                <DuckDuckGoIcon />
                <span>Continue with DuckDuckGo</span>
              </button>
            </div>

            <div className="my-5 flex items-center gap-3 text-[#7a7a7a]">
              <div className="h-px flex-1 bg-[#9f9f9f]" />
              <span className="text-xs">or</span>
              <div className="h-px flex-1 bg-[#9f9f9f]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="text-sm text-black">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="mt-1 w-full rounded-md border border-black bg-white px-3 py-2.5 text-sm text-black placeholder:text-black outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm text-black">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="mt-1 w-full rounded-md border border-black bg-white px-3 py-2.5 text-sm text-black placeholder:text-black outline-none"
                />
              </label>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#619da1]"
              >
                Log in
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-black/80">
              Dont have an account?{" "}
              <Link href="/signup" className="font-medium text-[#6FAFB3] hover:text-[#5b9ca1]">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
