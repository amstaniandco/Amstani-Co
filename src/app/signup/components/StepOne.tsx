"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";

type StepProps = {
  onNext: () => void;
};

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

export default function StepOne({ onNext }: StepProps) {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center">
      {/* Heading */}
      <h1 className="mb-12 text-[40px] font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
        Create Account
      </h1>

      {/* Auth buttons */}
      <div className="flex w-full flex-col gap-5">
        {/* Google */}
        <button
          onClick={() => { window.location.href = "/api/auth/google"; }}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-[16px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        {/* Facebook */}
        <button
          onClick={() => { window.location.href = "/api/auth/facebook"; }}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-[16px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]"
        >
          <FacebookIcon />
          <span>Continue with Facebook</span>
        </button>

        {/* X */}
        <button
          onClick={() => { window.location.href = "/api/auth/twitter"; }}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-[16px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]"
        >
          <XIcon />
          <span>Continue with X</span>
        </button>

        {/* Email */}
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-[16px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]"
        >
          <Mail size={20} className="text-gray-400 dark:text-slate-300" />
          <span>Continue with Email</span>
        </button>
      </div>

      {/* Login link */}
      <p className="mt-12 text-[15px] text-gray-500 dark:text-slate-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-teal-500 font-medium hover:text-teal-600 transition-colors duration-150"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
