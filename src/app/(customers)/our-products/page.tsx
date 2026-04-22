import { Suspense } from "react";
import StoreProductsView from "./components/StoreProductsView";

export default function OurProductsPage() {
  return (
    <Suspense>
      <StoreProductsView />
    </Suspense>
  );
}
