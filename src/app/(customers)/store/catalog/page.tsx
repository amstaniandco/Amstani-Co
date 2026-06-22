"use client";

import { Suspense } from "react";
import StoreCatalogClient from "./StoreCatalogClient";

export default function StoreCatalogPage() {
  return (
    <Suspense fallback={null}>
      <StoreCatalogClient />
    </Suspense>
  );
}
