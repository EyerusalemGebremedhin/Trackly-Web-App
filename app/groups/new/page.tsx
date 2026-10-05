"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { api, ApiError } from "@/lib/api";
import type { Group, PeriodType } from "@/lib/types";

function NewGroupContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cadence, setCadence] = useState<PeriodType>("weekly");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const group = await api.post<Group>("/groups", { name, checkin_cadence: cadence });
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create that group.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="font-serif text-3xl text-accent mb-1">New group</h1>
      <p className="text-sm text-muted mb-6">You'll automatically become its lead.</p>

      <form onSubmit={handleSubmit} className="bg-surface border border-hairline rounded-md p-5 space-y-4">
        {error && (
          <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-ink mb-1">Group name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Graduation Project, Engineering team"
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-ink mb-1">Check-in cadence</label>
          <select
            value={cadence}
            onChange={(e) => setCadence(e.target.value as PeriodType)}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="sprint">Sprint</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create group"}
        </button>
      </form>
    </div>
  );
}

export default function NewGroupPage() {
  return (
    <RequireAuth>
      <NewGroupContent />
    </RequireAuth>
  );
}
