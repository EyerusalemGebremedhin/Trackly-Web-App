"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, HelpCircle, Clock, Plus, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "./ui";
import Modal from "./Modal";
import { api, ApiError } from "@/lib/api";
import type { Task, TaskStatus, TaskPeriodType, GroupMember } from "@/lib/types";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To be done" },
  { key: "in_progress", label: "In progress" },
  { key: "in_review", label: "In review" },
];

const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "in_review", "done"];
const PERIOD_OPTIONS: TaskPeriodType[] = ["daily", "weekly", "monthly"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TaskCard({
  task,
  members,
  currentUserId,
  isLead,
  onChanged,
  onCompleted,
}: {
  task: Task;
  members: GroupMember[];
  currentUserId: number;
  isLead: boolean;
  onChanged: () => void;
  onCompleted: (title: string) => void;
}) {
  const assignee = members.find((m) => m.user_id === task.assignee_id);
  const isMine = task.assignee_id === currentUserId;
  const canEdit = isMine || isLead;
  const [reassignOpen, setReassignOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(status: TaskStatus) {
    setUpdating(true);
    setError(null);
    try {
      await api.patch(`/tasks/${task.id}`, { status });
      if (status === "done") onCompleted(task.title);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update status.");
    } finally {
      setUpdating(false);
    }
  }

  async function changePeriod(value: string) {
    setUpdating(true);
    setError(null);
    try {
      await api.patch(`/tasks/${task.id}`, { period_type: value || null });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change the plan type.");
    } finally {
      setUpdating(false);
    }
  }

  const overdue = task.deadline && task.status !== "done" && new Date(task.deadline) < new Date();

  return (
    <div className="bg-surface border border-hairline rounded-md p-3 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-ink font-medium leading-snug">{task.title}</p>
        {task.is_management_duty && (
          <span className="text-[10px] shrink-0 bg-blush text-primary px-1.5 py-0.5 rounded font-medium">Lead duty</span>
        )}
      </div>

      {task.description && <p className="text-xs text-muted">{task.description}</p>}

      <div className="flex items-center gap-2 flex-wrap">
        {assignee && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <span className="w-5 h-5 rounded-full bg-blush text-primary flex items-center justify-center text-[10px] font-medium">
              {initials(assignee.name)}
            </span>
            {assignee.name}
          </span>
        )}
        {task.deadline && (
          <span className={`flex items-center gap-1 text-xs ${overdue ? "text-danger" : "text-muted"}`}>
            <Clock size={11} /> {task.deadline}
          </span>
        )}
        {canEdit ? (
          <select
            value={task.period_type ?? ""}
            disabled={updating}
            onChange={(e) => changePeriod(e.target.value)}
            className="text-xs border border-hairline rounded px-1.5 py-0.5 bg-paper text-ink capitalize focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">No plan type</option>
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </select>
        ) : (
          task.period_type && (
            <span className="text-xs bg-blush text-primary px-1.5 py-0.5 rounded font-medium capitalize">
              {task.period_type}
            </span>
          )
        )}
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex items-center justify-between gap-2 pt-1">
        {isMine ? (
          <select
            value={task.status}
            disabled={updating}
            onChange={(e) => changeStatus(e.target.value as TaskStatus)}
            className="text-xs border border-hairline rounded px-1.5 py-1 bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "todo" ? "To be done" : s === "in_progress" ? "In progress" : s === "in_review" ? "In review" : "Done"}
              </option>
            ))}
          </select>
        ) : (
          <StatusBadge status={task.status} />
        )}

        <div className="flex items-center gap-1">
          {isMine && (
            <button title="Ask for help" onClick={() => setHelpOpen(true)} className="text-muted hover:text-primary p-1">
              <HelpCircle size={14} />
            </button>
          )}
          {isLead && (
            <button title="Reassign" onClick={() => setReassignOpen(true)} className="text-muted hover:text-primary p-1">
              <ArrowRightLeft size={14} />
            </button>
          )}
        </div>
      </div>

      {reassignOpen && (
        <ReassignModal
          task={task}
          members={members}
          onClose={() => setReassignOpen(false)}
          onDone={() => {
            setReassignOpen(false);
            onChanged();
          }}
        />
      )}
      {helpOpen && (
        <HelpRequestModal
          task={task}
          onClose={() => setHelpOpen(false)}
          onDone={() => setHelpOpen(false)}
        />
      )}
    </div>
  );
}

function ReassignModal({
  task,
  members,
  onClose,
  onDone,
}: {
  task: Task;
  members: GroupMember[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [newAssignee, setNewAssignee] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssignee || !reason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/tasks/${task.id}/reassign`, { new_assignee_id: newAssignee, reason });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reassign this task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Reassign "${task.title}"`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">New assignee</label>
          <select
            required
            value={newAssignee}
            onChange={(e) => setNewAssignee(Number(e.target.value))}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a member…</option>
            {members.filter((m) => m.user_id !== task.assignee_id).map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Reason for reassigning (required)</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. they're overloaded this week, or this needs backend skills"
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Reassigning…" : "Reassign"}
        </button>
      </form>
    </Modal>
  );
}

function HelpRequestModal({ task, onClose, onDone }: { task: Task; onClose: () => void; onDone: () => void }) {
  const [skill, setSkill] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!skill.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/groups/${task.group_id}/help-requests`, { skill_needed: skill, task_id: task.id, note });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Ask for help on "${task.title}"`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">What skill do you need help with?</label>
          <input
            required
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g. backend, design, debugging"
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Anything else? (optional)</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-hairline rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Request help"}
        </button>
      </form>
    </Modal>
  );
}

export default function TaskBoard({
  tasks,
  members,
  currentUserId,
  isLead,
  groupId,
  onChanged,
  onAssignClick,
}: {
  tasks: Task[];
  members: GroupMember[];
  currentUserId: number;
  isLead: boolean;
  groupId?: number;
  onChanged: () => void;
  onAssignClick?: () => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const completedHref = groupId ? `/completed?group=${groupId}` : "/completed";

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
          <Link href={completedHref} className="text-xs text-success underline shrink-0">
            View
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const showAddHere = isLead && col.key === "todo" && onAssignClick;
          return (
            <div key={col.key} className="bg-paper rounded-md">
              <div className="flex items-center justify-between mb-2 px-0.5">
                <p className="text-xs font-medium text-muted uppercase tracking-wide">{col.label}</p>
                <div className="flex items-center gap-1.5">
                  {showAddHere && (
                    <button
                      onClick={onAssignClick}
                      title="Assign new work"
                      className="text-primary hover:text-primary-hover"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  <span className="text-xs text-muted bg-surface border border-hairline rounded-full w-5 h-5 flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {colTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    members={members}
                    currentUserId={currentUserId}
                    isLead={isLead}
                    onChanged={onChanged}
                    onCompleted={setNotice}
                  />
                ))}
                {colTasks.length === 0 && showAddHere && (
                  <button
                    onClick={onAssignClick}
                    className="w-full border border-dashed border-hairline hover:border-primary rounded-md p-3 text-center text-xs text-muted hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus size={13} /> Assign the first task
                  </button>
                )}
                {colTasks.length === 0 && !showAddHere && (
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
            href={completedHref}
            className="block bg-success-bg border border-hairline hover:border-success rounded-md p-4 text-center transition-colors"
          >
            <CheckCircle2 size={22} className="text-success mx-auto mb-2" />
            <p className="text-sm text-ink font-medium">Completed work</p>
            <p className="text-xs text-muted mt-1">
              Finished tasks are saved here. Restore or reassign them any time.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
