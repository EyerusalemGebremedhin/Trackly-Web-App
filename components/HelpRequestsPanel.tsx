"use client";

import { useEffect, useState, useCallback } from "react";
import { HandHelping, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { HelpRequest, GroupMember } from "@/lib/types";

export default function HelpRequestsPanel({ groupId, members }: { groupId: number; members: GroupMember[] }) {
  const [requests, setRequests] = useState<HelpRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await api.get<HelpRequest[]>(`/groups/${groupId}/help-requests?open_only=true`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load help requests.");
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(id: number) {
    await api.post(`/groups/${groupId}/help-requests/${id}/resolve`);
    load();
  }

  function whoCanHelp(skill: string) {
    return members.filter((m) => m.skills?.toLowerCase().includes(skill.toLowerCase()));
  }

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (requests === null) return <p className="text-sm text-muted">Loading…</p>;
  if (requests.length === 0) return <p className="text-sm text-muted">No open help requests right now.</p>;

  return (
    <div className="space-y-2">
      {requests.map((r) => {
        const helpers = whoCanHelp(r.skill_needed);
        return (
          <div key={r.id} className="bg-warning-bg border-l-4 border-warning rounded-md p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-ink font-medium flex items-center gap-1.5">
                  <HandHelping size={14} /> {r.requested_by_name} needs help with <span className="capitalize">{r.skill_needed}</span>
                </p>
                {r.note && <p className="text-xs text-muted mt-0.5">{r.note}</p>}
                {helpers.length > 0 && (
                  <p className="text-xs text-muted mt-1">
                    Could ask: {helpers.map((h) => h.name).join(", ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => resolve(r.id)}
                title="Mark resolved"
                className="shrink-0 text-success hover:bg-success-bg rounded p-1"
              >
                <Check size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
