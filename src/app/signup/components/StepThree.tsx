"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SignupUsMap from "./SignupUsMap";
import { useToast } from "../../../components/global/ToastProvider";

type StepProps = {
  onBack: () => void;
  onSubmit: (state: string) => void;
  loading: boolean;
};

type UsStatesGeoJson = {
  features?: Array<{
    properties?: {
      NAME?: string;
    };
  }>;
};

export default function StepThree({ onBack, onSubmit, loading }: StepProps) {
  const router = useRouter();
  const toast = useToast();
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    let isActive = true;

    fetch("/us-states.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load states");
        }
        return res.json() as Promise<UsStatesGeoJson>;
      })
      .then((data) => {
        if (!isActive) {
          return;
        }

        const names = (data.features || [])
          .map((feature) => feature.properties?.NAME)
          .filter((name): name is string => Boolean(name))
          .sort((a, b) => a.localeCompare(b));

        setStates(names);
      })
      .catch(() => {
        if (isActive) {
          setStates([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = () => {
    if (!selectedState) {
      toast.error("Please select a state");
      return;
    }
    onSubmit(selectedState);
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <h2 className="mb-6 text-center text-xl font-semibold text-gray-900 dark:text-slate-100">Create Account</h2>

      <div className="mb-4">
        <label className="text-sm text-gray-600 dark:text-slate-300">State</label>
        <select
          value={selectedState}
          onChange={(event) => setSelectedState(event.target.value)}
          className="ui-input mt-1 w-full rounded-md border border-transparent bg-gray-100 p-3"
        >
          <option value="">Select Your State</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 rounded-2xl bg-slate-100 p-2 dark:bg-[#1d1b14] sm:p-3">
        <SignupUsMap
          selectedState={selectedState}
          onStateSelect={(state) => setSelectedState(state)}
        />
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-full bg-[#6FAFB3] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

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
