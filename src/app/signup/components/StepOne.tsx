"use client";

import { Mail } from "lucide-react";

type StepProps = {
  onNext: () => void;
};

// Duck icon as SVG since lucide doesn't have DuckDuckGo
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

// Google icon
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

// Apple icon
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

export default function StepOne({ onNext }: StepProps) {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col items-center justify-center p-4">
      {/* Step indicator */}
      {/* Heading */}
      <h1 className="mb-8 text-[32px] font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
        Create Account
      </h1>

      {/* Auth buttons */}
      <div className="flex w-full flex-col gap-4">
        {/* Google */}
        <button className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-[17px] text-[15.5px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]">
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        {/* Apple */}
        <button className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-[17px] text-[15.5px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]">
          <AppleIcon />
          <span>Continue with Apple</span>
        </button>

        {/* DuckDuckGo */}
        <button className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-[17px] text-[15.5px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]">
          <DuckDuckGoIcon />
          <span>Continue with DuckDuckGo</span>
        </button>

        {/* Email */}
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-[17px] text-[15.5px] font-medium text-gray-900 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:bg-[#1a2538]"
        >
          <Mail size={20} className="text-gray-400 dark:text-slate-300" />
          <span>Continue with Email</span>
        </button>
      </div>

      {/* Login link */}
      <p className="mt-8 text-[14px] text-gray-500 dark:text-slate-400">
        Already have an account?{" "}
        <button
          type="button"
          className="text-teal-500 font-medium hover:text-teal-600 transition-colors duration-150"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
