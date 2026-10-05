"use client";

import { useState } from "react";
import Modal from "./Modal";
import { api, ApiError } from "@/lib/api";
import type { Priority, TaskPeriodType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function NewPlanModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [periodType, setPeriodType] = useState<TaskPeriodType>("weekly");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/tasks", {
        title,
        description: description || null,
        assignee_id: user.id,
        group_id: null,
        priority,
        estimated_hours: estimatedHours,
        deadline: deadline || null,
        period_type: periodType,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create that plan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="New personal plan" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you planning to do?"
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
          <label className="text-xs text-muted block mb-1">Plan type</label>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as TaskPeriodType)}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm bg-paper text-ink capitalize focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="text-xs text-muted mt-1">You can change this later if you picked the wrong one.</p>
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
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create plan"}
        </button>
      </form>
    </Modal>
  );
}