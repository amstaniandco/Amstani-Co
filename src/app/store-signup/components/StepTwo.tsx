import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreSignupFormData } from "../page";
import { useToast } from "../../../components/global/ToastProvider";

type StepProps = {
  formData: StoreSignupFormData;
  updateFormData: (fields: Partial<StoreSignupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function StepTwo({ formData, updateFormData, onNext, onBack }: StepProps) {
  const router = useRouter();
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value } as Partial<StoreSignupFormData>);
  };

  const passwordMismatch = Boolean(formData.password || formData.confirmPassword) && formData.password !== formData.confirmPassword;
  const passwordTooShort = Boolean(formData.password) && formData.password.length < 6;
  const canContinue = !passwordMismatch && !passwordTooShort;

  const handleNext = () => {
    if (passwordMismatch) {
      toast.error("Passwords do not match.");
      return;
    }
    if (passwordTooShort) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    onNext();
  };

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
        {/* Password */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm text-gray-700 dark:text-slate-300">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Placeholder"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className={`mt-4 w-full rounded-2xl bg-[#6FAFB3] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#619da1] ${canContinue ? "" : "opacity-80"}`}
        >
          Next
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
