"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { api, ApiError } from "@/lib/api";
import type { Group } from "@/lib/types";

function PastGroupsContent() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get<Group[]>("/groups/past").then(setGroups);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function restore(id: number) {
    setError(null);
    try {
      await api.post(`/groups/${id}/unarchive`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reopen that group.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/groups" className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-3">
          <ArrowLeft size={14} /> Back to groups
        </Link>
        <h1 className="font-serif text-3xl text-accent">Past groups</h1>
        <p className="text-sm text-muted mt-1">
          Groups that have been stopped - finished, with no more work or check-ins happening.
          Nothing here is ever deleted. A group's lead can reopen it below if that was a mistake.
        </p>
      </div>

      {error && (
        <div className="text-sm bg-danger-bg text-danger border-l-4 border-danger px-3 py-2 rounded mb-4">{error}</div>
      )}

      {groups === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="bg-surface border border-hairline rounded-md p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No stopped groups yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-surface border border-hairline rounded-md p-4 shadow-sm flex items-start justify-between gap-2"
            >
              <Link href={`/groups/${g.id}`} className="flex-1 opacity-90 hover:opacity-100">
                <p className="font-serif text-lg text-accent">{g.name}</p>
                <p className="text-xs text-muted mt-1 capitalize">{g.checkin_cadence} check-ins · Stopped</p>
              </Link>
              {g.my_role === "lead" ? (
                <button
                  onClick={() => restore(g.id)}
                  title="Reopen this group"
                  className="shrink-0 flex items-center gap-1.5 text-xs text-primary border border-primary rounded-md px-2.5 py-1.5 hover:bg-blush"
                >
                  <RotateCcw size={13} /> Reopen
                </button>
              ) : (
                <span className="shrink-0 text-xs text-muted px-2.5 py-1.5">Only the lead can reopen</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PastGroupsPage() {
  return (
    <RequireAuth>
      <PastGroupsContent />
    </RequireAuth>
  );
}