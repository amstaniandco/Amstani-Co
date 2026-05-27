"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload, ArrowLeft, Loader } from "lucide-react";
import type { StoreSignupFormData } from "../page";
import { useToast } from "../../../components/global/ToastProvider";

type StepProps = {
  formData: StoreSignupFormData;
  updateFormData: (fields: Partial<StoreSignupFormData>) => void;
  onBack: () => void;
};

export default function StepThree({ formData, updateFormData, onBack }: StepProps) {
  const router = useRouter();
  const toast = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value } as Partial<StoreSignupFormData>);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "logoUrl" | "bannerUrl" | "cardMediaUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileNames((prev) => ({ ...prev, [fieldName]: file.name }));

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Image upload failed");
        return;
      }
      toast.success("Image uploaded successfully.");
      updateFormData({ [fieldName]: data.url } as Partial<StoreSignupFormData>);
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/store-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not submit signup request");
        return;
      }
      toast.success("Signup request submitted successfully.");
      setIsVerifying(true);
    } catch {
      toast.error("Could not submit signup request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCreate = Boolean(formData.storeName.trim()) && !isSubmitting;

  if (isVerifying) {
    return (
      <div className="flex w-full flex-col items-center justify-center text-center">
        <h1 className="mb-8 text-[40px] font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
          Create an account
        </h1>

        <div className="mb-8 flex justify-center">
          <Loader size={48} className="animate-spin text-[#6FAFB3]" />
        </div>

        <h2 className="mb-3 text-[24px] font-bold text-gray-900 dark:text-slate-100">
          Verification in Progress...
        </h2>

        <p className="text-[15px] text-gray-600 dark:text-slate-300 max-w-[400px] mb-12">
          We are currently verifying your account. You will be notified soon via email.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#6FAFB3] hover:bg-[#619da1] text-white font-medium transition-colors duration-150"
        >
          <ArrowLeft size={16} />
          <span>Go back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="text-black dark:text-slate-100">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-black transition-colors duration-150 dark:text-slate-200"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <h1 className="mb-12 text-[40px] font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
        Create an account
      </h1>

      <div className="flex w-full flex-col gap-6">
        {/* Store Name */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Store Name</label>
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Store Description */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Store Description</label>
          <input
            type="text"
            name="storeDescription"
            value={formData.storeDescription}
            onChange={handleChange}
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Store Icon Upload */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Store Icon</label>
          <label className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-5 transition-colors hover:border-teal-500 dark:border-slate-600 dark:bg-[#111827]">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "logoUrl")}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-slate-300">{fileNames.logoUrl || formData.logoUrl ? "Image ready" : "Upload Image"}</span>
            </div>
          </label>
        </div>

        {/* Store Cover Upload */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Store Cover</label>
          <label className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-5 transition-colors hover:border-teal-500 dark:border-slate-600 dark:bg-[#111827]">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "bannerUrl")}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-slate-300">{fileNames.bannerUrl || formData.bannerUrl ? "Image ready" : "Upload Image"}</span>
            </div>
          </label>
        </div>

        {/* Store Card Media Upload */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Store Card Media</label>
          <label className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-5 transition-colors hover:border-teal-500 dark:border-slate-600 dark:bg-[#111827]">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "cardMediaUrl")}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-slate-300">{fileNames.cardMediaUrl || formData.cardMediaUrl ? "Image ready" : "Upload Image"}</span>
            </div>
          </label>
        </div>

        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className="mt-4 w-full rounded-2xl bg-[#6FAFB3] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#619da1] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Create"}
        </button>
      </div>

      <p className="mt-12 text-center text-[15px] text-gray-500 dark:text-slate-400">
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
