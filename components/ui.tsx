import type { TaskStatus } from "@/lib/types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-blush text-ink",
  in_progress: "bg-warning-bg text-ink",
  in_review: "bg-blush text-primary",
  blocked: "bg-danger-bg text-danger",
  done: "bg-success-bg text-success",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  blocked: "Blocked",
  done: "Done",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StatCard({
  label,
  value,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  accent?: "primary" | "success" | "warning" | "danger";
}) {
  const accentColor = {
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
  }[accent];

  return (
    <div className="bg-surface border border-hairline rounded-md p-4 shadow-sm" style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}>
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="font-serif text-3xl text-accent">{value}</p>
    </div>
  );
}
