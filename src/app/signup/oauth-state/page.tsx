"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignupLayout from "../components/SignupLayout";
import StepThree from "../components/StepThree";
import { useToast } from "../../../components/global/ToastProvider";

type PendingOAuthData = {
  provider: string;
  name: string;
  email: string;
};

export default function OAuthStatePage() {
  const router = useRouter();
  const toast = useToast();
  const [pendingData, setPendingData] = useState<PendingOAuthData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/oauth/pending")
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json() as PendingOAuthData;
        setPendingData(data);
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [router]);

  const handleBack = () => {
    router.push("/login");
  };

  const handleSubmit = async (state: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/oauth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });

      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok) {
        toast.error(data.error || "Failed to complete sign up");
        return;
      }

      router.push("/");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] dark:bg-[#0b1220]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-[#6FAFB3] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pendingData) {
    return null;
  }

  return (
    <SignupLayout step={3}>
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Welcome,{" "}
          <span className="font-semibold text-gray-800 dark:text-slate-200">
            {pendingData.name}
          </span>
          {pendingData.email && (
            <>
              {" "}
              (<span className="text-[#6FAFB3]">{pendingData.email}</span>)
            </>
          )}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          One last step — select your state to finish creating your account.
        </p>
      </div>

      <StepThree
        onBack={handleBack}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </SignupLayout>
  );
}
