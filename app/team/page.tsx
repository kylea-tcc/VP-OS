"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { mockTeam } from "@/data/mock/team";
import { cn, formatCurrency } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Minus, Users, Target,
  Calendar, Zap, AlertTriangle, ChevronRight,
} from "lucide-react";

function MomentumIcon({ momentum }: { momentum: "up" | "steady" | "down" }) {
  if (momentum === "up") return <TrendingUp className="w-4 h-4 text-success-bright" />;
  if (momentum === "down") return <TrendingDown className="w-4 h-4 text-danger-bright" />;
  return <Minus className="w-4 h-4 text-ink-3" />;
}

function MemberCard({ member }: { member: (typeof mockTeam)[0] }) {
  const momentumColor = {
    up: "border-success/20 bg-success-muted",
    steady: "border-border",
    down: "border-danger/20 bg-danger-muted",
  };

  return (
    <div className="card overflow-hidden group cursor-pointer hover:-translate-y-px transition-all duration-200 hover:shadow-card-hover">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-atlas flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{member.avatar}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-1">{member.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-ink-3">{member.title}</span>
                <span className="text-ink-4">·</span>
                <span className="text-[11px] text-ink-3">{member.region}</span>
              </div>
            </div>
          </div>

          {/* Momentum */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold",
            momentumColor[member.momentum],
            member.momentum === "up" ? "text-success-bright" :
            member.momentum === "down" ? "text-danger-bright" : "text-ink-3"
          )}>
            <MomentumIcon momentum={member.momentum} />
            <span className="capitalize">{member.momentum}</span>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-ink-1 tabular-nums">{member.metrics.atlasDemos}</div>
            <div className="text-[10px] text-atlas-bright font-medium uppercase tracking-wider mt-0.5">Atlas Demos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-ink-1 tabular-nums">{member.metrics.meetingsBooked}</div>
            <div className="text-[10px] text-ink-3 font-medium uppercase tracking-wider mt-0.5">Meetings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-ink-1 tabular-nums">{member.metrics.dealsCreated}</div>
            <div className="text-[10px] text-ink-3 font-medium uppercase tracking-wider mt-0.5">Created</div>
          </div>
        </div>

        {/* Pipeline bar */}
        <div className="mt-4 flex items-center justify-between mb-1">
          <span className="text-[11px] text-ink-3">Active Pipeline</span>
          <span className="text-sm font-semibold text-ink-1 tabular-nums">
            {formatCurrency(member.metrics.pipeline)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              member.momentum === "up" ? "bg-success" :
              member.momentum === "down" ? "bg-danger" : "bg-accent"
            )}
            style={{ width: `${Math.min((member.metrics.pipeline / 3500000) * 100, 100)}%` }}
          />
        </div>

        {/* Activity summary */}
        <div className="mt-3 flex items-center gap-3 text-[11px]">
          <div className={cn(
            "flex items-center gap-1",
            member.metrics.dealsAdvanced > 0 ? "text-success-bright" : "text-ink-4"
          )}>
            <TrendingUp className="w-3 h-3" />
            <span>{member.metrics.dealsAdvanced} advanced</span>
          </div>
          {member.metrics.dealsStalled > 0 && (
            <div className="flex items-center gap-1 text-danger-bright">
              <AlertTriangle className="w-3 h-3" />
              <span>{member.metrics.dealsStalled} stalled</span>
            </div>
          )}
        </div>
      </div>

      {/* Coaching signals */}
      {member.coachingSignals.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Coaching Signals</div>
          <div className="flex flex-col gap-1.5">
            {member.coachingSignals.map((signal, i) => {
              const isRisk = signal.toLowerCase().includes("stall") ||
                signal.toLowerCase().includes("silent") ||
                signal.toLowerCase().includes("no ") ||
                signal.toLowerCase().includes("zero") ||
                signal.toLowerCase().includes("cold");
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className={cn(
                    "w-1 h-1 rounded-full flex-shrink-0 mt-1.5",
                    isRisk ? "bg-warn" : "bg-success"
                  )} />
                  <span className="text-xs text-ink-2 leading-relaxed">{signal}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const totalPipeline = mockTeam.reduce((s, m) => s + m.metrics.pipeline, 0);
  const totalDemos = mockTeam.reduce((s, m) => s + m.metrics.atlasDemos, 0);
  const totalMeetings = mockTeam.reduce((s, m) => s + m.metrics.meetingsBooked, 0);

  return (
    <div className="min-h-full">
      <PageHeader
        title="Team"
        subtitle="Momentum, follow-through, and coaching signals"
      />

      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* Team summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4">
            <div className="stat-label mb-1">Team Pipeline</div>
            <div className="text-xl font-bold text-ink-1 tabular-nums">{formatCurrency(totalPipeline)}</div>
            <div className="text-xs text-ink-3 mt-1">combined active</div>
          </div>
          <div className="card p-4">
            <div className="stat-label mb-1">Atlas Demos</div>
            <div className="text-xl font-bold text-atlas-bright tabular-nums">{totalDemos}</div>
            <div className="text-xs text-ink-3 mt-1">this period</div>
          </div>
          <div className="card p-4">
            <div className="stat-label mb-1">Meetings Booked</div>
            <div className="text-xl font-bold text-ink-1 tabular-nums">{totalMeetings}</div>
            <div className="text-xs text-ink-3 mt-1">total</div>
          </div>
        </div>

        {/* Leaderboard snapshot */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <span className="section-heading">Pipeline Rank</span>
          </div>
          <div className="divide-y divide-border">
            {[...mockTeam]
              .sort((a, b) => b.metrics.pipeline - a.metrics.pipeline)
              .map((member, i) => (
                <div key={member.memberId} className="flex items-center px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-lg font-bold text-ink-4 w-7 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/60 to-atlas/60 flex items-center justify-center flex-shrink-0 mx-2">
                    <span className="text-[10px] font-bold text-white">{member.avatar}</span>
                  </div>
                  <span className="text-sm text-ink-1 flex-1">{member.name}</span>
                  <MomentumIcon momentum={member.momentum} />
                  <span className="text-sm font-semibold text-ink-1 tabular-nums ml-3">
                    {formatCurrency(member.metrics.pipeline)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Member cards */}
        <div className="grid lg:grid-cols-2 gap-4">
          {mockTeam.map((member) => (
            <MemberCard key={member.memberId} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}
