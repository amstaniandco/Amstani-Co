export default function StepThree() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>

      <div className="mb-4">
        <label className="text-sm text-gray-600">State</label>
        <select className="w-full mt-1 p-3 rounded-md bg-gray-100">
          <option>Select Your State</option>
        </select>
      </div>

      {/* Dummy Map */}
      <div className="h-52 bg-[#6FAFB3] rounded-xl flex items-center justify-center text-white mb-5">
        Map Placeholder
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
