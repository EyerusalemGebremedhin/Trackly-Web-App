"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import AuthField from "@/components/AuthField";

export default function SignupPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      variant="signup"
      title="Create your account"
      subtitle="Track your own progress, or lead a team."
      headline="Start with one honest check-in."
      blurb="Set up in a minute. Plan your own work, or bring your team onto one shared board."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded">
            {error}
          </div>
        )}

        <AuthField
          label="Name"
          icon={User}
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthField
          label="Password"
          icon={Lock}
          type="password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          hint="At least 6 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  );
}