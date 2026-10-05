"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import AuthField from "@/components/AuthField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      variant="login"
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to choose a new one."
      headline="It happens to everyone."
      blurb="Reset it in a minute and get straight back to your progress."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="text-sm bg-success-bg text-success border-l-4 border-success px-4 py-3 rounded">
          If that email is registered, a reset link is on its way. It works for 30 minutes. Check your spam folder too.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded">{error}</div>
          )}

          <AuthField
            label="Email"
            icon={Mail}
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl py-3.5 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
