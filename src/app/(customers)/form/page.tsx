import { Suspense } from "react";
import FormPageClient from "./FormPageClient";

export default function FormPage() {
  return (
    <Suspense fallback={null}>
      <FormPageClient />
    </Suspense>
  );
}
