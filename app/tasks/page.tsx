"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockTasks } from "@/data/mock/tasks";
import { cn, formatDate } from "@/lib/utils";
import type { TaskCategory } from "@/data/types";
import {
  CheckSquare, Circle, Clock, AlertTriangle, ArrowRight, ChevronDown, ChevronUp,
  Briefcase, Users, Zap, Building, User, LayoutGrid,
} from "lucide-react";

type ViewFilter = "today" | "high_impact" | "waiting" | "ceo_board" | "team";

const VIEWS: { value: ViewFilter; label: string; icon: React.ElementType }[] = [
  { value: "today", label: "Today", icon: Clock },
  { value: "high_impact", label: "High Impact", icon: Zap },
  { value: "waiting", label: "Waiting", icon: AlertTriangle },
  { value: "ceo_board", label: "CEO / Board", icon: Building },
  { value: "team", label: "Team Follow-up", icon: Users },
];

const categoryConfig: Record<TaskCategory, { label: string; color: string; icon: React.ElementType }> = {
  ceo_board: { label: "CEO / Board", color: "text-atlas-bright", icon: Building },
  team_followup: { label: "Team", color: "text-core-bright", icon: Users },
  deal: { label: "Deal", color: "text-accent-bright", icon: Briefcase },
  strategy: { label: "Strategy", color: "text-renewals-bright", icon: LayoutGrid },
  admin: { label: "Admin", color: "text-ink-3", icon: LayoutGrid },
  personal: { label: "Personal", color: "text-ink-3", icon: User },
};

const impactColor = {
  high: "text-danger-bright bg-danger-muted border-danger/20",
  medium: "text-warn bg-warn-muted border-warn/15",
  low: "text-ink-3 bg-white/[0.04] border-border",
};

const urgencyDot = {
  urgent: "bg-danger animate-pulse",
  normal: "bg-accent",
  low: "bg-ink-4",
};

function TaskCard({ task }: { task: (typeof mockTasks)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);
  const cfg = categoryConfig[task.category];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "card transition-all duration-200",
        done && "opacity-40"
      )}
    >
      <div
        className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Check */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDone(!done);
            }}
            className="flex-shrink-0 mt-0.5 group/check"
          >
            {done ? (
              <CheckSquare className="w-4 h-4 text-success" />
            ) : (
              <Circle className="w-4 h-4 text-ink-4 group-hover/check:text-ink-2 transition-colors" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            {/* Category + impact */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <div className="flex items-center gap-1">
                <Icon className={cn("w-3 h-3", cfg.color)} />
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", cfg.color)}>
                  {cfg.label}
                </span>
              </div>
              <span className="text-ink-4">·</span>
              <span className="text-[10px] text-ink-3">{task.project}</span>
              <div className={cn(
                "ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                impactColor[task.impact]
              )}>
                <div className={cn("w-1 h-1 rounded-full flex-shrink-0", urgencyDot[task.urgency])} />
                {task.impact} impact
              </div>
            </div>

            {/* Title */}
            <p className={cn(
              "text-sm font-medium text-ink-1 leading-snug",
              done && "line-through text-ink-3"
            )}>
              {task.title}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-2">
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-ink-4" />
                  <span className={cn(
                    "text-[11px]",
                    task.dueDate === "2026-04-23" ? "text-warn font-medium" : "text-ink-3"
                  )}>
                    {task.dueDate === "2026-04-23" ? "Due today" : `Due ${formatDate(task.dueDate)}`}
                  </span>
                </div>
              )}
              <span className="text-[11px] text-ink-3">{task.timeCommitment}</span>
              {task.relatedAccount && (
                <>
                  <span className="text-ink-4">·</span>
                  <span className="text-[11px] text-ink-3">{task.relatedAccount}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 text-ink-4 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Subtasks</div>
              <div className="flex flex-col gap-1.5">
                {task.subtasks.map((sub, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-ink-4 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-ink-2">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Notes</div>
              <p className="text-xs text-ink-2 leading-relaxed">{task.notes}</p>
            </div>
          )}

          {task.status === "waiting" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warn-muted border border-warn/20">
              <AlertTriangle className="w-3.5 h-3.5 text-warn" />
              <span className="text-xs text-warn font-medium">Waiting on someone</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  const [view, setView] = useState<ViewFilter>("today");

  const filtered = mockTasks.filter((t) => {
    if (t.status === "done") return false;
    switch (view) {
      case "today": return t.dueDate === "2026-04-23";
      case "high_impact": return t.impact === "high";
      case "waiting": return t.status === "waiting";
      case "ceo_board": return t.category === "ceo_board";
      case "team": return t.category === "team_followup";
      default: return true;
    }
  });

  const open = mockTasks.filter((t) => t.status !== "done").length;
  const urgent = mockTasks.filter((t) => t.urgency === "urgent" && t.status !== "done").length;

  return (
    <div className="min-h-full">
      <PageHeader
        title="Tasks"
        subtitle="Personal action list — deals, board prep, team coaching"
        right={
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-ink-1">{open}</div>
              <div className="text-[11px] text-ink-3">open</div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-right">
              <div className="text-sm font-semibold text-danger">{urgent}</div>
              <div className="text-[11px] text-ink-3">urgent</div>
            </div>
          </div>
        }
      />

      {/* View switcher */}
      <div className="px-4 lg:px-6 pt-5">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {VIEWS.map((v) => {
            const isActive = view === v.value;
            const Icon = v.icon;
            return (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                  isActive
                    ? "bg-accent-muted text-accent-bright border border-accent/20"
                    : "text-ink-3 hover:text-ink-1 hover:bg-white/[0.04]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {v.label}
                {isActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent-bright">
                    {filtered.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-8 h-8 mx-auto mb-3 text-success opacity-50" />
            <p className="text-sm text-ink-3">All clear in this view</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((task) => (
              <TaskCard key={task.taskId} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
