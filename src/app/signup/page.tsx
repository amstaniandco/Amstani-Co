"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignupLayout from "./components/SignupLayout";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    role: "user" as "user" | "owner" | "admin",
  });

  const handleStepTwoSubmit = async (updatedFormData: typeof formData) => {
    setFormData(updatedFormData);
    
    // Validate
    if (!updatedFormData.name || !updatedFormData.email || !updatedFormData.password) {
      setError("All fields are required");
      return;
    }
    if (updatedFormData.password !== updatedFormData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (updatedFormData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setError("");
    setCurrentStep(3);
  };

  const handleStepThreeSubmit = async (state: string) => {
    setFormData((prev) => ({ ...prev, state }));
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          state,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/login?message=Signup successful! Please login.");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during signup");
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
          error={error}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {currentStep === 3 && (
        <StepThree
          onBack={() => setCurrentStep(2)}
          onSubmit={handleStepThreeSubmit}
          loading={loading}
          error={error}
        />
      )}
    </SignupLayout>
  );
}
