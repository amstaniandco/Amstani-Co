"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/global/ToastProvider";
import SignupLayout from "./components/SignupLayout";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
  });

  const handleStepTwoSubmit = async (updatedFormData: typeof formData) => {
    setFormData(updatedFormData);
    
    // Validate
    if (!updatedFormData.name || !updatedFormData.email || !updatedFormData.password) {
      toast.error("All fields are required");
      return;
    }
    if (updatedFormData.password !== updatedFormData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (updatedFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setCurrentStep(3);
  };

  const handleStepThreeSubmit = async (state: string) => {
    setFormData((prev) => ({ ...prev, state }));
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          state,
          role: "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Signup failed");
        return;
      }

      toast.success("Signup successful! Please login.");
      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupLayout step={currentStep}>
      {currentStep === 1 && (
        <StepOne onNext={() => setCurrentStep(2)} />
      )}
      {currentStep === 2 && (
        <StepTwo 
          onNext={handleStepTwoSubmit}
          onBack={() => setCurrentStep(1)}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {currentStep === 3 && (
        <StepThree
          onBack={() => setCurrentStep(2)}
          onSubmit={handleStepThreeSubmit}
          loading={loading}
        />
      )}
    </SignupLayout>
  );
}
