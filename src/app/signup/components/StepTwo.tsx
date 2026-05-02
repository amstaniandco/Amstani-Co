import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  state: string;
  role: "user" | "owner" | "admin";
};

type StepProps = {
  onNext: (formData: FormData) => void;
  onBack: () => void;
  error: string;
  formData: FormData;
  setFormData: (data: FormData) => void;
};

export default function StepTwo({ onNext, onBack, error, formData, setFormData }: StepProps) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-black dark:text-slate-200">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="ui-input mt-1 w-full rounded-md border border-black bg-white p-3 text-black placeholder:text-black focus:outline-none"
            placeholder="Name"
          />
        </div>

        <div>
          <label className="text-sm text-black dark:text-slate-200">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="ui-input mt-1 w-full rounded-md border border-black bg-white p-3 text-black placeholder:text-black focus:outline-none"
            placeholder="Email"
          />
        </div>

        <div>
          <label className="text-sm text-black dark:text-slate-200">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="ui-input mt-1 w-full rounded-md border border-black bg-white p-3 text-black placeholder:text-black focus:outline-none"
            placeholder="Password"
          />
        </div>

        <div>
          <label className="text-sm text-black dark:text-slate-200">Confirm Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="ui-input mt-1 w-full rounded-md border border-black bg-white p-3 text-black placeholder:text-black focus:outline-none"
            placeholder="Confirm Password"
          />
        </div>

        <div>
          <label className="text-sm text-black dark:text-slate-200 mb-2 block">I am a...</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="user"
                checked={formData.role === "user"}
                onChange={(e) => setFormData({ ...formData, role: "user" })}
                className="w-4 h-4 text-[#6FAFB3] focus:ring-[#6FAFB3] cursor-pointer"
              />
              <span className="text-black dark:text-slate-200">Shopper</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="owner"
                checked={formData.role === "owner"}
                onChange={(e) => setFormData({ ...formData, role: "owner" })}
                className="w-4 h-4 text-[#6FAFB3] focus:ring-[#6FAFB3] cursor-pointer"
              />
              <span className="text-black dark:text-slate-200">Store Owner</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === "admin"}
                onChange={(e) => setFormData({ ...formData, role: "admin" })}
                className="w-4 h-4 text-[#6FAFB3] focus:ring-[#6FAFB3] cursor-pointer"
              />
              <span className="text-black dark:text-slate-200">Admin</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-full bg-[#6FAFB3] text-black font-medium mt-2"
        >
          Next
        </button>
      </form>

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
