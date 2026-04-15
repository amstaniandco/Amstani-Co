type StepProps = {
  onNext: () => void;
};

export default function StepTwo({ onNext }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            className="w-full mt-1 p-3 rounded-md bg-gray-100 focus:outline-none"
            placeholder="Name"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            className="w-full mt-1 p-3 rounded-md bg-gray-100 focus:outline-none"
            placeholder="Email"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            className="w-full mt-1 p-3 rounded-md bg-gray-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Confirm Password</label>
          <input
            type="password"
            className="w-full mt-1 p-3 rounded-md bg-gray-100 focus:outline-none"
          />
        </div>

        <button
          onClick={onNext}
          className="w-full py-3 rounded-full bg-[#6FAFB3] text-white font-medium mt-2"
        >
          Next
        </button>
      </div>

      <p className="text-sm text-center mt-5 text-gray-500">
        Already have an account?{" "}
        <span className="text-[#6FAFB3] cursor-pointer">Log in</span>
      </p>
    </div>
  );
}
