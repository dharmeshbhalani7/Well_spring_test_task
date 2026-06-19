"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/modules/auth/components/LoginForm";

export default function LoginPageClient() {
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <LoginForm expired={expired} />
    </div>
  );
}
