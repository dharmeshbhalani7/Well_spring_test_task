import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
