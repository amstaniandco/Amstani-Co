import { Suspense } from "react";
import StoreProductsClient from "./StoreProductsClient";

export default function AdminStoreProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6"><div className="mx-auto flex min-h-[400px] max-w-[1500px] items-center justify-center text-slate-600">Loading store page…</div></div>}>
      <StoreProductsClient />
    </Suspense>
  );
}
