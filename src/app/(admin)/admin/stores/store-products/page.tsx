import { Suspense } from "react";
import StoreProductsClient from "./StoreProductsClient";

export default function AdminStoreProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-page-shell">
          <div className="flex min-h-[400px] items-center justify-center text-slate-600">
            Loading store page...
          </div>
        </div>
      }
    >
      <StoreProductsClient />
    </Suspense>
  );
}
