import { Suspense } from "react";
import StoreProductsView from "../our-products/components/StoreProductsView";

export default function SalePage() {
  return (
    <Suspense>
      <StoreProductsView />
    </Suspense>
  );
}
