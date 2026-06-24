import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type SignupLayoutProps = {
  children: ReactNode;
  step: number;
};

export default function SignupLayout({ children, step }: SignupLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#f7f7f7] dark:bg-[#0b1220]">
      {/* LEFT IMAGE */}
      <div className="hidden md:block w-1/2 relative">
        <Image
          src="/assets/AmstaniCover.png"
          alt="Amstani & Co cover"
          fill
          loading="eager"
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[500px]">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-black transition-colors duration-150 hover:text-[#6FAFB3] dark:text-slate-200"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>

          <p className="mb-2 text-center text-sm text-gray-500 dark:text-slate-400">
            Step {step}/3
          </p>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full ${
                  i <= step ? "bg-[#6FAFB3]" : "bg-gray-300 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
