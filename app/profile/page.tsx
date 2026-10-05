"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/auth-context";

function ProfileContent() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const body: Record<string, string> = { name };
      if (email && email !== user?.email) body.email = email;
      if (password) body.password = password;
      await api.patch<User>("/users/me", body);
      await refreshUser();
      setPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="font-serif text-3xl text-accent mb-6">Profile</h1>

      <form onSubmit={handleSubmit} className="bg-surface border border-hairline rounded-md p-5 space-y-4">
        {error && (
          <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm bg-success-bg text-success border-l-4 border-success px-3 py-2 rounded">
            Saved.
          </div>
        )}

        <div>
          <label className="block text-sm text-ink mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted mt-1">This is also what you use to log in.</p>
        </div>

        <div>
          <label className="block text-sm text-ink mb-1">New password</label>
          <input
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm text-danger mt-6 hover:underline"
      >
        <LogOut size={14} /> Log out
      </button>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
