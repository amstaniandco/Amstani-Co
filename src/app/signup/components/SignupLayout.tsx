import type { ReactNode } from "react";
import Image from "next/image";

type SignupLayoutProps = {
  children: ReactNode;
  step: number;
};

export default function SignupLayout({ children, step }: SignupLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#f7f7f7]">
      {/* LEFT IMAGE */}
      <div className="hidden md:block w-1/2 relative">
        <Image
          src="/assets/AmstaniCover.png"
          alt="Amstani & Co cover"
          fill
          className="object-cover"
        />

        {/* Overlay Logo */}
        <div className="absolute top-10 left-10 text-white">
          <div className="text-2xl font-semibold tracking-wide">
            AMSTANI & CO
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-[380px]">
          <p className="text-center text-sm text-gray-500 mb-2">
            Step {step}/3
          </p>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full ${
                  i <= step ? "bg-[#6FAFB3]" : "bg-gray-300"
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
