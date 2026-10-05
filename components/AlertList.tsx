import { AlertTriangle, Clock } from "lucide-react";
import type { Alert } from "@/lib/types";

export default function AlertList({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((a, i) => {
        const isOverdue = a.type === "overdue_task";
        return (
          <div
            key={i}
            className={`flex items-start gap-2 px-4 py-3 rounded-md border-l-4 text-sm ${
              isOverdue
                ? "bg-danger-bg border-danger text-ink"
                : "bg-warning-bg border-warning text-ink"
            }`}
          >
            {isOverdue ? (
              <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
            ) : (
              <Clock size={16} className="text-ink mt-0.5 shrink-0" />
            )}
            <span>{a.message}</span>
          </div>
        );
      })}
    </div>
  );
}
