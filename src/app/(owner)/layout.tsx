import type { ReactNode } from "react";
import OwnerSidebar from "@/src/components/owner/OwnerSidebar";
import { TutorialProvider } from "../../components/owner/tutorial/TutorialProvider";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <TutorialProvider>
      <div className="h-screen bg-[#efefef] overflow-hidden">
        <div className="flex h-full flex-col md:flex-row">
          <OwnerSidebar />
          <main className="flex-1 overflow-y-auto p-3 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </TutorialProvider>
  );
}
