"use client";

import { useEffect, useState } from "react";
import SignupLayout from "./components/SignupLayout";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";

export type StoreSignupFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  password: string;
  confirmPassword: string;
  storeName: string;
  storeDescription: string;
  logoUrl: string;
  bannerUrl: string;
  cardMediaUrl: string;
};

export default function StoreSignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoreSignupFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeDescription: "",
    logoUrl: "",
    bannerUrl: "",
    cardMediaUrl: "",
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/store-signup");
        const data = await res.json();
        if (!mounted) return;

        if (!res.ok || !data.eligible) {
          setAccessError(data.error || data.reason || "You are not eligible for store signup yet.");
          return;
        }

        setRequestStatus(data.status ?? null);
        setFormData((prev) => ({
          ...prev,
          fullName: data.user?.name ?? "",
          email: data.user?.email ?? "",
          phoneNumber: data.user?.phone ?? "",
          address: data.user?.address ?? "",
          state: data.user?.state ?? "",
          storeName: data.store?.name ?? "",
          storeDescription: data.store?.description ?? "",
          logoUrl: data.store?.logoUrl ?? "",
          bannerUrl: data.store?.bannerUrl ?? "",
          cardMediaUrl: data.store?.cardMediaUrl ?? "",
        }));
      } catch {
        if (mounted) setAccessError("Could not load your approved store application.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const updateFormData = (fields: Partial<StoreSignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  if (loading) {
    return (
      <SignupLayout step={step}>
        <div className="text-center text-slate-600 dark:text-slate-300">Loading your approved application...</div>
      </SignupLayout>
    );
  }

  if (accessError) {
    return (
      <SignupLayout step={step}>
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-slate-100">Store signup unavailable</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">{accessError}</p>
        </div>
      </SignupLayout>
    );
  }

  if (requestStatus === "pending" || requestStatus === "approved" || requestStatus === "denied") {
    const message =
      requestStatus === "approved"
        ? "Your store signup was approved. Please log in again to access the owner panel."
        : requestStatus === "denied"
        ? "Your store signup request was denied by admin."
        : "Your store signup request is waiting for admin verification.";

    return (
      <SignupLayout step={step}>
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-slate-100">Verification status</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      </SignupLayout>
    );
  }

  return (
    <SignupLayout step={step}>
      {step === 1 && <StepOne formData={formData} updateFormData={updateFormData} onNext={() => setStep(2)} />}
      {step === 2 && (
        <StepTwo formData={formData} updateFormData={updateFormData} onNext={() => setStep(3)} onBack={() => setStep(1)} />
      )}
      {step === 3 && <StepThree formData={formData} updateFormData={updateFormData} onBack={() => setStep(2)} />}
    </SignupLayout>
  );
}
