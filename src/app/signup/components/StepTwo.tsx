import { ArrowLeft } from "lucide-react";

type StepProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function StepTwo({ onNext, onBack }: StepProps) {
  return (
    <div className="text-black">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-black transition-colors duration-150"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <h2 className="text-xl font-bold text-center mb-6 text-black">Create Account</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-black">Name</label>
          <input
            className="w-full mt-1 p-3 rounded-md border border-black bg-white text-black placeholder:text-black focus:outline-none"
            placeholder="Name"
          />
        </div>

        <div>
          <label className="text-sm text-black">Email</label>
          <input
            className="w-full mt-1 p-3 rounded-md border border-black bg-white text-black placeholder:text-black focus:outline-none"
            placeholder="Email"
          />
        </div>

        <div>
          <label className="text-sm text-black">Password</label>
          <input
            type="password"
            className="w-full mt-1 p-3 rounded-md border border-black bg-white text-black placeholder:text-black focus:outline-none"
            placeholder="Password"
          />
        </div>

        <div>
          <label className="text-sm text-black">Confirm Password</label>
          <input
            type="password"
            className="w-full mt-1 p-3 rounded-md border border-black bg-white text-black placeholder:text-black focus:outline-none"
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

      <p className="text-sm text-center mt-5 text-black">
        Already have an account?{" "}
        <span className="text-black font-medium cursor-pointer">Log in</span>
      </p>
    </div>
  );
}
