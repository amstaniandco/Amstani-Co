import { Suspense } from "react";
import StoreProductsView from "../our-products/components/StoreProductsView";

export default function NewArrivalsPage() {
  return (
    <Suspense>
      <StoreProductsView />
    </Suspense>
  );
}
