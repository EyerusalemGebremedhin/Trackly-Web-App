"use client";

import { useState } from "react";
import Modal from "./Modal";
import { api, ApiError } from "@/lib/api";
import type { GroupMember, Priority } from "@/lib/types";

export default function AssignTaskModal({
  groupId,
  members,
  onClose,
  onDone,
}: {
  groupId: number;
  members: GroupMember[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [deadline, setDeadline] = useState("");
  const [isManagementDuty, setIsManagementDuty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!assigneeId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/tasks", {
        title,
        description: description || null,
        assignee_id: assigneeId,
        group_id: groupId,
        priority,
        estimated_hours: estimatedHours,
        deadline: deadline || null,
        is_management_duty: isManagementDuty,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create that task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Assign new work" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Description (optional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Assign to</label>
          <select
            required
            value={assigneeId}
            onChange={(e) => setAssigneeId(Number(e.target.value))}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a member…</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full border border-hairline rounded-md px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Estimated hours</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={isManagementDuty} onChange={(e) => setIsManagementDuty(e.target.checked)} />
          This is a lead management duty, not delegated work
        </label>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Assigning…" : "Assign task"}
        </button>
      </form>
    </Modal>
  );
}
