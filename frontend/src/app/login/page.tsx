import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import LoginPageClient from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
