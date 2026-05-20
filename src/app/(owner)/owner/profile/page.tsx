import { Suspense } from "react";
import ProfilePageClient from "./ProfilePageClient";

export default function OwnerProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageClient />
    </Suspense>
  );
}
