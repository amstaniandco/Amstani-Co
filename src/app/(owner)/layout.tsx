import type { ReactNode } from "react";
import OwnerSidebar from "@/src/components/owner/OwnerSidebar";
import { TutorialProvider } from "../../components/owner/tutorial/TutorialProvider";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <TutorialProvider>
      <div className="h-screen bg-[#efefef] overflow-hidden">
        <div className="flex h-full">
          <OwnerSidebar />
          <main className="flex-1 h-full overflow-y-auto p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </TutorialProvider>
  );
}
