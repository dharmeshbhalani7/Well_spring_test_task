"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi, ApiRequestError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

const schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError("Missing reset token in URL");
      return;
    }
    setError(null);
    try {
      await authApi.confirmPasswordReset(token, data.newPassword);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Reset failed",
      );
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md">
          <Alert variant="error">
            Invalid reset link. Request a new one from the login page.
          </Alert>
          <Link href="/login" className="mt-4 block text-teal-600 hover:underline">
            Back to login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>

        {success ? (
          <>
            <Alert variant="success">Password updated successfully.</Alert>
            <Link href="/login" className="mt-4 block text-teal-600 hover:underline">
              Sign in with new password
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            <Input
              label="New password"
              type="password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <Input
              label="Confirm password"
              type="password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
