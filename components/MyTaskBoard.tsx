"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Task, TaskStatus, TaskPeriodType } from "@/lib/types";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To be done" },
  { key: "in_progress", label: "In progress" },
  { key: "in_review", label: "In review" },
];

const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "in_review", "done"];
const PERIOD_OPTIONS: TaskPeriodType[] = ["daily", "weekly", "monthly"];
const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To be done",
  in_progress: "In progress",
  in_review: "In review",
  blocked: "Blocked",
  done: "Done",
};

function PlanCard({
  task,
  onChanged,
  onCompleted,
}: {
  task: Task;
  onChanged: () => void;
  onCompleted: (title: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const overdue = task.deadline && task.status !== "done" && new Date(task.deadline) < new Date();
  const isGroupTask = task.group_id !== null;

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/tasks/${task.id}`, body);
      if (body.status === "done") onCompleted(task.title);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-surface border border-hairline rounded-md p-3 shadow-sm space-y-2">
      <p className="text-sm text-ink font-medium leading-snug">{task.title}</p>
      {task.description && <p className="text-xs text-muted">{task.description}</p>}

      <div className="flex items-center gap-2 flex-wrap">
        {task.deadline && (
          <span className={`flex items-center gap-1 text-xs ${overdue ? "text-danger" : "text-muted"}`}>
            <Clock size={11} /> {task.deadline}
          </span>
        )}
        <select
          value={task.period_type ?? ""}
          disabled={busy}
          onChange={(e) => patch({ period_type: e.target.value || null })}
          className="text-xs border border-hairline rounded px-1.5 py-0.5 bg-paper text-ink capitalize focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">No plan type</option>
          {PERIOD_OPTIONS.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p}
            </option>
          ))}
        </select>
        {isGroupTask && (
          <span className="text-xs bg-blush text-primary px-1.5 py-0.5 rounded font-medium">Group task</span>
        )}
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="pt-1">
        <select
          value={task.status}
          disabled={busy}
          onChange={(e) => patch({ status: e.target.value as TaskStatus })}
          className="text-xs border border-hairline rounded px-1.5 py-1 bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function MyTaskBoard({ tasks, onChanged }: { tasks: Task[]; onChanged: () => void }) {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(id);
  }, [notice]);

  return (
    <div>
      {notice && (
        <div className="mb-3 flex items-center justify-between gap-3 bg-success-bg border-l-4 border-success rounded-md px-4 py-2.5">
          <p className="text-sm text-success">Done: &quot;{notice}&quot;. It is saved in Completed work.</p>
          <Link href="/completed" className="text-xs text-success underline shrink-0">
            View
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="bg-paper rounded-md">
              <div className="flex items-center justify-between mb-2 px-0.5">
                <p className="text-xs font-medium text-muted uppercase tracking-wide">{col.label}</p>
                <span className="text-xs text-muted bg-surface border border-hairline rounded-full w-5 h-5 flex items-center justify-center">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {colTasks.map((t) => (
                  <PlanCard key={t.id} task={t} onChanged={onChanged} onCompleted={setNotice} />
                ))}
                {colTasks.length === 0 && (
                  <div className="border border-dashed border-hairline rounded-md p-3 text-center text-xs text-muted">
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="bg-paper rounded-md">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Completed</p>
          </div>
          <Link
            href="/completed"
            className="block bg-success-bg border border-hairline hover:border-success rounded-md p-4 text-center transition-colors"
          >
            <CheckCircle2 size={22} className="text-success mx-auto mb-2" />
            <p className="text-sm text-ink font-medium">Completed work</p>
            <p className="text-xs text-muted mt-1">Finished tasks are saved here. Restore or reopen them any time.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
