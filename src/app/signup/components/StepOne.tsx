import { Apple, Globe } from "lucide-react";

type StepProps = {
  onNext: () => void;
};

export default function StepOne({ onNext }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>

      <div className="space-y-3">
        <button className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white border shadow-sm hover:bg-gray-50">
          <Globe size={18} />
          Continue with Google
        </button>

        <button className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white border shadow-sm hover:bg-gray-50">
          <Apple size={18} />
          Continue with Apple
        </button>

        <button className="w-full py-3 rounded-full bg-white border shadow-sm hover:bg-gray-50">
          Continue with DuckDuckGo
        </button>

        <button
          onClick={onNext}
          className="w-full py-3 rounded-full bg-white border shadow-sm hover:bg-gray-50"
        >
          Continue with Email
        </button>
      </div>

      <p className="text-sm text-center mt-5 text-gray-500">
        Already have an account?{" "}
        <span className="text-[#6FAFB3] cursor-pointer">Log in</span>
      </p>
    </div>
  );
}
