"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/modules/auth/hooks";
import { authApi, ApiRequestError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm({ expired }: { expired?: boolean }) {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      router.push("/programs");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Login failed");
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage(null);
    try {
      const res = await authApi.requestPasswordReset(resetEmail);
      setResetMessage(res.message);
    } catch (err) {
      setResetMessage(
        err instanceof ApiRequestError ? err.message : "Request failed",
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
      <p className="mt-1 text-sm text-gray-500">
        Welcome back to Wellspring Admin
      </p>

      {expired && (
        <Alert variant="info">
          Your session has expired. Please sign in again.
        </Alert>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        No account?{" "}
        <Link
          href="/signup"
          className="font-medium text-teal-600 hover:underline"
        >
          Sign up
        </Link>
      </p>

      {/* <div className="mt-4 border-t pt-4">
        <button
          type="button"
          onClick={() => setShowReset(!showReset)}
          className="text-sm text-teal-600 hover:underline"
        >
          Forgot password?
        </button>
        {showReset && (
          <form onSubmit={handleResetRequest} className="mt-3 space-y-3">
            <Input
              label="Email for reset"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Dev mode: reset token is logged to the backend console.
            </p>
            <Button type="submit" variant="secondary" disabled={resetLoading}>
              {resetLoading ? "Sending..." : "Send reset link"}
            </Button>
            {resetMessage && <Alert variant="info">{resetMessage}</Alert>}
          </form>
        )}
      </div> */}
    </Card>
  );
}
