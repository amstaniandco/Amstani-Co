"use client";

import { useState } from "react";
import SignupLayout from "./components/SignupLayout";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";

export default function SignupPage() {
  const [step, setStep] = useState(1);

  return (
    <SignupLayout step={step}>
      {step === 1 && <StepOne onNext={() => setStep(2)} />}
      {step === 2 && <StepTwo onNext={() => setStep(3)} />}
      {step === 3 && <StepThree />}
    </SignupLayout>
  );
}
