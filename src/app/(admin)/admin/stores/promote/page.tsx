import { Suspense } from "react";
import PromotePageClient from "./PromotePageClient";

export default function AdminStorePromotePage() {
  return (
    <Suspense fallback={null}>
      <PromotePageClient />
    </Suspense>
  );
}
