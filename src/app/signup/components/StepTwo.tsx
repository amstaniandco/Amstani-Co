import { ArrowLeft } from "lucide-react";

type StepProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function StepTwo({ onNext, onBack }: StepProps) {
  return (
    <div className="text-black dark:text-slate-100">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-black transition-colors duration-150 dark:text-slate-200"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <h2 className="mb-6 text-center text-xl font-bold text-black dark:text-slate-100">Create Account</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-black dark:text-slate-200">Name</label>
          <input
            className="ui-input mt-1 w-full rounded-md border border-black bg-white p-3 text-black placeholder:text-black focus:outline-none"
            placeholder="Name"
          />
        </div>

        <div>
          <label className="text-sm text-black dark:text-slate-200">Email</label>
          <input
            className="ui-input mt-1 w-full rounded-md border border-black bg-white p-3 text-black placeholder:text-black focus:outline-none"
            placeholder="Email"
          />
        </div>

        <div>
          <label className="text-sm text-black dark:text-slate-200">Password</label>
          <input
            type="password"
            className="ui-input mt-1 w-full rounded-md border border-black bg-white p-3 text-black placeholder:text-black focus:outline-none"
            placeholder="Password"
          />
        </div>

        <div>
          <label className="text-sm text-black dark:text-slate-200">Confirm Password</label>
          <input
            type="password"
            className="ui-input mt-1 w-full rounded-md border border-black bg-white p-3 text-black placeholder:text-black focus:outline-none"
            placeholder="Confirm Password"
          />
        </div>

        <button
          onClick={onNext}
          className="w-full py-3 rounded-full bg-[#6FAFB3] text-black font-medium mt-2"
        >
          Next
        </button>
      </div>

      <p className="mt-5 text-center text-sm text-black dark:text-slate-300">
        Already have an account?{" "}
        <span className="cursor-pointer font-medium text-black dark:text-slate-100">Log in</span>
      </p>
    </div>
  );
}
