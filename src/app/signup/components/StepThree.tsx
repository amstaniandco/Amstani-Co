"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import SignupUsMap from "./SignupUsMap";

type StepProps = {
  onBack: () => void;
};

type UsStatesGeoJson = {
  features?: Array<{
    properties?: {
      NAME?: string;
    };
  }>;
};

export default function StepThree({ onBack }: StepProps) {
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

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>

      <div className="mb-4">
        <label className="text-sm text-gray-600">State</label>
        <select
          value={selectedState}
          onChange={(event) => setSelectedState(event.target.value)}
          className="w-full mt-1 p-3 rounded-md bg-gray-100"
        >
          <option value="">Select Your State</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <SignupUsMap
          selectedState={selectedState}
          onStateSelect={(state) => setSelectedState(state)}
        />
      </div>

      <button className="w-full py-3 rounded-full bg-[#6FAFB3] text-white font-medium">
        Create Account
      </button>

      <p className="text-sm text-center mt-5 text-gray-500">
        Already have an account?{" "}
        <span className="text-[#6FAFB3] cursor-pointer">Log in</span>
      </p>
    </div>
  );
}
