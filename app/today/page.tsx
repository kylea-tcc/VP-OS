"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DealCard } from "@/components/ui/DealCard";
import { mockMeetings, todayMeetings } from "@/data/mock/meetings";
import { mockTasks } from "@/data/mock/tasks";
import { mockInsights } from "@/data/mock/insights";
import { mockDeals } from "@/data/mock/deals";
import { formatTime, formatDate, cn, bucketColor, bucketLabel } from "@/lib/utils";
import {
  Sun,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
  Star,
  ArrowRight,
  Users,
  Video,
  Target,
  TrendingUp,
  FileText,
} from "lucide-react";

const todayTasks = mockTasks.filter(
  (t) => t.dueDate === "2026-04-23" && t.status !== "done"
);
const criticalInsights = mockInsights.filter((i) => i.severity === "critical");
const atRiskDeals = mockDeals.filter(
  (d) => d.riskStatus === "at_risk" || d.riskStatus === "stalled"
);
const atlasDemosToday = todayMeetings.filter((m) => m.type === "atlas_demo");

function MeetingCard({ meeting }: { meeting: (typeof mockMeetings)[0] }) {
  const typeConfig = {
    atlas_demo: { label: "Atlas Demo", color: "text-atlas-bright", bg: "bg-atlas-muted" },
    pipeline_followup: { label: "Pipeline", color: "text-accent-bright", bg: "bg-accent-muted" },
    internal: { label: "Internal", color: "text-ink-3", bg: "bg-white/[0.05]" },
    external: { label: "External", color: "text-core-bright", bg: "bg-core-muted" },
    renewal_review: { label: "Renewal", color: "text-renewals-bright", bg: "bg-renewals-muted" },
  };
  const cfg = typeConfig[meeting.type];

  return (
    <div className="card card-hover p-4 cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className={cn("w-2 h-2 rounded-full mt-1.5", meeting.type === "atlas_demo" ? "bg-atlas" : meeting.type === "internal" ? "bg-ink-4" : "bg-accent")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>
              {cfg.label}
            </span>
            <span className="text-xs text-ink-3">
              {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-ink-1 leading-snug">{meeting.title}</h4>
          {meeting.company && (
            <p className="text-xs text-ink-3 mt-0.5">{meeting.company}</p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <Users className="w-3 h-3 text-ink-4" />
            <span className="text-[11px] text-ink-3">
              {meeting.participants.slice(0, 3).join(", ")}
              {meeting.participants.length > 3 && ` +${meeting.participants.length - 3}`}
            </span>
          </div>
          {/* Granola context */}
          {meeting.granolaContext && (
            <div className="mt-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="w-3 h-3 text-accent-bright" />
                <span className="text-[10px] font-semibold text-accent-bright uppercase tracking-wider">Granola Context</span>
              </div>
              <p className="text-xs text-ink-2 leading-relaxed">{meeting.granolaContext}</p>
            </div>
          )}
          {/* Follow-ups */}
          {meeting.followUps.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {meeting.followUps.map((fu, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-ink-4" />
                  <span className="text-xs text-ink-3">{fu}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: (typeof mockTasks)[0] }) {
  const impactColor = {
    high: "text-danger-bright",
    medium: "text-warn",
    low: "text-ink-3",
  };
  const urgency = task.urgency === "urgent";

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group">
      <div className={cn(
        "w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 transition-colors",
        urgency ? "border-danger/50 group-hover:border-danger" : "border-border-strong group-hover:border-ink-3"
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm text-ink-1 leading-snug">{task.title}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={cn("text-[10px] font-semibold uppercase", impactColor[task.impact])}>
              {task.impact}
            </span>
          </div>
        </div>
        {task.relatedAccount && (
          <span className="text-[11px] text-ink-3">{task.relatedAccount}</span>
        )}
      </div>
    </div>
  );
}

export default function TodayPage() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-full">
      <PageHeader
        title="Good morning, Kyle"
        subtitle={dateStr}
        right={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-muted border border-accent/20">
            <Sun className="w-3.5 h-3.5 text-accent-bright" />
            <span className="text-xs font-medium text-accent-bright">Morning Brief</span>
          </div>
        }
      />

      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-8">

        {/* ── Critical Alerts ──────────────────────────────────────────── */}
        {criticalInsights.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-danger" />
              <span className="section-heading text-danger">Needs Attention Now</span>
            </div>
            <div className="flex flex-col gap-2">
              {criticalInsights.map((insight) => (
                <div
                  key={insight.insightId}
                  className="card p-4 border-danger/20 cursor-pointer hover:border-danger/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                        <span className="text-[10px] font-semibold text-danger uppercase tracking-wider">Critical</span>
                      </div>
                      <p className="text-sm font-semibold text-ink-1">{insight.title}</p>
                      <p className="text-xs text-ink-2 mt-1 leading-relaxed">{insight.whyItMatters}</p>
                    </div>
                    {insight.actionLabel && (
                      <button className="flex-shrink-0 text-[11px] font-semibold text-danger-bright px-3 py-1.5 rounded-lg bg-danger-muted border border-danger/20 hover:bg-danger/20 transition-colors">
                        {insight.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Meetings Today"
              value={String(todayMeetings.length)}
              sub={`${atlasDemosToday.length} Atlas demo${atlasDemosToday.length !== 1 ? "s" : ""}`}
              icon={Calendar}
              accent="atlas"
            />
            <StatCard
              label="Tasks Due"
              value={String(todayTasks.length)}
              sub={`${todayTasks.filter(t => t.urgency === "urgent").length} urgent`}
              icon={CheckCircle2}
              accent="warn"
            />
            <StatCard
              label="At-Risk Deals"
              value={String(atRiskDeals.length)}
              sub="Across all pipelines"
              icon={AlertTriangle}
              accent="danger"
            />
            <StatCard
              label="Commit Pipeline"
              value="$1.5M"
              sub="3 deals in commit"
              icon={Target}
              accent="success"
            />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Today's Schedule ──────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-ink-3" />
              <span className="section-heading">Today&apos;s Schedule</span>
              <span className="text-[10px] text-ink-4 ml-auto">{todayMeetings.length} meetings</span>
            </div>
            <div className="flex flex-col gap-2">
              {todayMeetings.map((m) => (
                <MeetingCard key={m.meetingId} meeting={m} />
              ))}
            </div>
          </section>

          {/* ── Tasks due today ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-ink-3" />
              <span className="section-heading">Tasks Due Today</span>
              <span className="text-[10px] text-ink-4 ml-auto">{todayTasks.length} open</span>
            </div>
            <div className="card divide-y divide-border">
              {todayTasks.map((task) => (
                <TaskRow key={task.taskId} task={task} />
              ))}
            </div>
          </section>
        </div>

        {/* ── Deals needing attention ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-ink-3" />
            <span className="section-heading">Deals Needing Attention</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            {atRiskDeals.map((deal) => (
              <DealCard key={deal.dealId} deal={deal} showPersonalNote />
            ))}
          </div>
        </section>

        {/* ── Team highlights ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-ink-3" />
            <span className="section-heading">Team Highlights</span>
          </div>
          <div className="card divide-y divide-border">
            {[
              { name: "Marcus Webb", signal: "Oregon BHS deal created today — good sourcing", type: "positive" },
              { name: "DeShawn Carter", signal: "Nevada DOC in negotiation — 8 days silent, needs re-engagement plan", type: "warning" },
              { name: "Jamie Torres", signal: "Colorado renewal progressing — Maricopa almost closed", type: "positive" },
              { name: "Priya Sharma", signal: "Atlas demo at 2pm — no prep notes loaded yet", type: "warning" },
            ].map((item) => (
              <div key={item.name} className="flex items-start gap-3 p-3.5">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5",
                  item.type === "positive" ? "bg-success" : "bg-warn"
                )} />
                <div>
                  <span className="text-sm font-medium text-ink-1">{item.name}</span>
                  <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">{item.signal}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
