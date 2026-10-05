"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, CheckCircle2 } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import AlertList from "@/components/AlertList";
import ProgressSlider from "@/components/ProgressSlider";
import { StatCard } from "@/components/ui";
import CheckinForm from "@/components/CheckinForm";
import Slideshow from "@/components/Slideshow";
import InsightPanel from "@/components/InsightPanel";
import MyTaskBoard from "@/components/MyTaskBoard";
import NewPlanModal from "@/components/NewPlanModal";
import { api } from "@/lib/api";
import type { MyDashboard } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

function DashboardContent() {
  const { user } = useAuth();
  const [dash, setDash] = useState<MyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPlanOpen, setNewPlanOpen] = useState(false);

  const load = useCallback(async () => {
    const data = await api.get<MyDashboard>("/dashboard/me");
    setDash(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !dash) {
    return <p className="text-sm text-muted">Loading your progress…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-accent">Hi {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted mt-1">Here's where things stand.</p>
      </div>

      <Slideshow />

      <ProgressSlider />

      <AlertList alerts={dash.alerts} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total tasks" value={dash.total_tasks} />
        <StatCard label="Done" value={dash.done_tasks} accent="success" />
        <StatCard label="Overdue" value={dash.overdue_tasks} accent="danger" />
        <StatCard label="Completion rate" value={`${dash.completion_rate}%`} accent="primary" />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-serif text-xl text-accent">Your plans</h2>
          <div className="flex items-center gap-2">
            <Link 
            href="/completed"
             className="flex items-center gap-1.5 text-muted hover:text-ink border border-hairline rounded-md px-3 py-2 text-sm"
            >
           <CheckCircle2 size={14} /> Completed work
    
            </Link>
            <button
              onClick={() => setNewPlanOpen(true)}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white rounded-md px-3 py-2 text-sm font-medium"
            >
              <Plus size={14} /> New plan
            </button>
          </div>
        </div>
        {dash.tasks.length === 0 ? (
          <p className="text-sm text-muted">No tasks yet. They'll show up here once assigned, personal or group.</p>
        ) : (
          <MyTaskBoard tasks={dash.tasks} onChanged={load} />
        )}
      </div>

      <div>
        <h2 className="font-serif text-xl text-accent mb-3">Check in</h2>
        <CheckinForm onSubmitted={load} />
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-xl text-accent mb-3">Your AI insight</h2>
        <InsightPanel endpoint={(period, refresh) => `/insights/me?period=${period}&refresh=${refresh}`} />
      </div>

      {newPlanOpen && (
        <NewPlanModal
          onClose={() => setNewPlanOpen(false)}
          onDone={() => {
            setNewPlanOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}