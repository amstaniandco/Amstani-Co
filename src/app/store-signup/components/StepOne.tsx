"use client";

import { useRouter } from "next/navigation";
import type { StoreSignupFormData } from "../page";

type StepProps = {
  formData: StoreSignupFormData;
  updateFormData: (fields: Partial<StoreSignupFormData>) => void;
  onNext: () => void;
};

export default function StepOne({ formData, updateFormData, onNext }: StepProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value } as Partial<StoreSignupFormData>);
  };

  const canContinue = Boolean(
    formData.fullName.trim() &&
      formData.email.trim() &&
      formData.phoneNumber.trim() &&
      formData.state.trim()
  );

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center">
      {/* Heading */}
      <h1 className="mb-12 text-[40px] font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
        Create an account
      </h1>

      {/* Form fields */}
      <div className="flex w-full flex-col gap-5">
        {/* Full Name */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-slate-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* State */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="mt-4 w-full rounded-2xl bg-[#6FAFB3] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#619da1] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
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
