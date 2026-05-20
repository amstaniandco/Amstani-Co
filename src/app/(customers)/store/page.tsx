import { Suspense } from "react";
import StorePageClient from "./StorePageClient";

export default function StorePage() {
  return (
    <Suspense fallback={null}>
      <StorePageClient />
    </Suspense>
  );
}
