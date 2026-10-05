"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserPlus, UserMinus, Crown, Archive, Plus, RotateCcw } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import AlertList from "@/components/AlertList";
import CheckinForm from "@/components/CheckinForm";
import TaskBoard from "@/components/TaskBoard";
import AssignTaskModal from "@/components/AssignTaskModal";
import HelpRequestsPanel from "@/components/HelpRequestsPanel";
import InsightPanel from "@/components/InsightPanel";
import { StatCard } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Group, GroupDashboard, GroupGoal, Task, GroupMember, PeriodType } from "@/lib/types";

function GroupContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [goal, setGoal] = useState<GroupGoal | null>(null);
  const [dash, setDash] = useState<GroupDashboard | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLead, setIsLead] = useState<boolean | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addMemberMsg, setAddMemberMsg] = useState<string | null>(null);
  const [newGoalText, setNewGoalText] = useState("");

  const load = useCallback(async () => {
    const g = await api.get<Group>(`/groups/${groupId}`);
    setGroup(g);

    const ms = await api.get<GroupMember[]>(`/groups/${groupId}/members`);
    setMembers(ms);
    const mine = ms.find((m) => m.user_id === user?.id);
    setIsLead(mine?.role === "lead");

    try {
      setGoal(await api.get<GroupGoal>(`/groups/${groupId}/goals/latest`));
    } catch {
      setGoal(null);
    }

    const t = await api.get<Task[]>(`/tasks?group_id=${groupId}`);
    setTasks(t);

    if (mine?.role === "lead") {
      try {
        setDash(await api.get<GroupDashboard>(`/dashboard/group/${groupId}`));
      } catch {
        setDash(null);
      }
    }
  }, [groupId, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setAddMemberMsg(null);
    try {
      await api.post(`/groups/${groupId}/members`, { email: memberEmail, role: "member" });
      setAddMemberMsg(`Added ${memberEmail}.`);
      setMemberEmail("");
      load();
    } catch (err) {
      setAddMemberMsg(err instanceof ApiError ? err.message : "Couldn't add that person.");
    }
  }

  async function handleRemoveMember(userId: number) {
    if (!confirm("Remove this person from the group?")) return;
    await api.del(`/groups/${groupId}/members/${userId}`);
    load();
  }

  async function handleTransferLead(userId: number) {
    if (!confirm("Transfer group lead to this person? You'll become a regular member.")) return;
    await api.post(`/groups/${groupId}/transfer-lead`, { new_lead_user_id: userId });
    load();
  }

  async function handleArchive() {
    if (!group) return;
    const archiving = !group.is_archived;
    if (archiving) {
      if (
        !confirm(
          "Stop this group? This means the group is done - no more work, no more check-ins. It moves to Past Groups, and nothing in it is ever deleted, but it's no longer active."
        )
      )
        return;
    }
    await api.post(`/groups/${groupId}/${archiving ? "archive" : "unarchive"}`);
    load();
  }

  async function handleSetGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    await api.post(`/groups/${groupId}/goals`, {
      goal_text: newGoalText,
      period_type: group.checkin_cadence,
    });
    setNewGoalText("");
    load();
  }

  if (!group || isLead === null || !user) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const myTasks = tasks.filter((t) => t.assignee_id === user.id);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-accent">{group.name}</h1>
          {group.description && <p className="text-sm text-ink mt-1">{group.description}</p>}
          <p className="text-sm text-muted mt-1 capitalize">
            {group.checkin_cadence} check-ins · {isLead ? "You lead this group" : "Member"}
          </p>
        </div>
        {isLead && (
          <div className="flex items-center gap-2">
            {!group.is_archived && (
              <button
                onClick={() => setAssignOpen(true)}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white rounded-md px-3 py-2 text-sm font-medium"
              >
                <Plus size={14} /> Assign work
              </button>
            )}
            <button
              onClick={handleArchive}
              title={group.is_archived ? "Reopen this group - it becomes active again" : "Stop this group - it's finished, no more work or check-ins"}
              className="flex items-center gap-1.5 text-muted hover:text-ink border border-hairline rounded-md px-3 py-2 text-sm"
            >
              {group.is_archived ? <RotateCcw size={14} /> : <Archive size={14} />}
              {group.is_archived ? "Reopen group" : "Stop group"}
            </button>
          </div>
        )}
      </div>

      {group.is_archived && (
        <div className="bg-danger-bg border-l-4 border-danger rounded-md px-4 py-3 mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-danger">
            This group is stopped. It's in Past Groups - no new work can be assigned here.
          </p>
          {isLead && (
            <button onClick={handleArchive} className="text-xs text-danger underline shrink-0">
              Reopen it
            </button>
          )}
        </div>
      )}

      {goal && (
        <div className="bg-blush border-l-4 border-primary rounded-md px-4 py-3 mb-6">
          <p className="text-xs text-muted mb-0.5">Goal for this {group.checkin_cadence.replace("ly", "")}</p>
          <p className="text-sm text-ink">{goal.goal_text}</p>
        </div>
      )}

      {isLead && dash && (
        <>
          <AlertList alerts={dash.alerts} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Members" value={dash.members.length} />
            <StatCard label="Open tasks" value={dash.total_open_tasks} />
            <StatCard label="Overdue" value={dash.total_overdue_tasks} accent="danger" />
          </div>
        </>
      )}

      <div className="mb-8">
        <h2 className="font-serif text-xl text-accent mb-3">Board</h2>
        <TaskBoard tasks={tasks} members={members} currentUserId={user.id} isLead={isLead} onChanged={load} onAssignClick={() => setAssignOpen(true)} />
      </div>

      <div className="mb-8">
        <h2 className="font-serif text-xl text-accent mb-3">Help requests</h2>
        <HelpRequestsPanel groupId={groupId} members={members} />
      </div>

      {isLead && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="font-serif text-xl text-accent mb-3">Members</h2>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.user_id} className="bg-surface border border-hairline rounded-md p-3 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ink font-medium flex items-center gap-1.5">
                      {m.name}
                      {m.role === "lead" && <Crown size={13} className="text-primary" />}
                    </p>
                    {m.skills && <p className="text-xs text-muted">{m.skills}</p>}
                  </div>
                  {m.user_id !== user.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTransferLead(m.user_id)}
                        title="Make lead"
                        className="text-muted hover:text-primary p-1.5"
                      >
                        <Crown size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(m.user_id)}
                        title="Remove"
                        className="text-muted hover:text-danger p-1.5"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMember} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                placeholder="teammate@email.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="flex-1 border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white rounded-md px-3 py-2 text-sm font-medium"
              >
                <UserPlus size={14} /> Add
              </button>
            </form>
            {addMemberMsg && <p className="text-xs text-muted mt-1">{addMemberMsg}</p>}
          </div>

          <div>
            <h2 className="font-serif text-xl text-accent mb-3">Set this period's goal</h2>
            <form onSubmit={handleSetGoal} className="bg-surface border border-hairline rounded-md p-4 shadow-sm space-y-3">
              <textarea
                required
                rows={3}
                placeholder="What should the group focus on this period?"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                className="w-full border border-hairline rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 text-sm font-medium">
                Set goal
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-serif text-xl text-accent mb-3">AI insight</h2>
        <InsightPanel endpoint={(period, refresh) => `/insights/group/${groupId}?period=${period}&refresh=${refresh}`} />
      </div>

      {!isLead && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-serif text-xl text-accent mb-3">Your tasks here</h2>
            {myTasks.length > 0 ? (
              <p className="text-sm text-muted">See the board above - filtered to your items automatically.</p>
            ) : (
              <p className="text-sm text-muted">No tasks assigned to you in this group yet.</p>
            )}
          </div>
          <div>
            <h2 className="font-serif text-xl text-accent mb-3">Check in</h2>
            <CheckinForm groupId={groupId} defaultGoal={goal?.goal_text} cadence={group.checkin_cadence as PeriodType} onSubmitted={load} />
          </div>
        </div>
      )}

      {assignOpen && (
        <AssignTaskModal
          groupId={groupId}
          members={members}
          onClose={() => setAssignOpen(false)}
          onDone={() => {
            setAssignOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function GroupPage() {
  return (
    <RequireAuth>
      <GroupContent />
    </RequireAuth>
  );
}