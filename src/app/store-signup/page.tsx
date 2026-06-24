"use client";

import { useState } from "react";
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

  const updateFormData = (fields: Partial<StoreSignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

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
