import { Suspense } from "react";
import StoreChatPageClient from "./StoreChatPageClient";

export default function StoreChatPage() {
  return (
    <Suspense fallback={null}>
      <StoreChatPageClient />
    </Suspense>
  );
}
