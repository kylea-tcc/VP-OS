"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockChangeEvents } from "@/data/mock/events";
import { cn, formatCurrency, bucketColor, bucketLabel } from "@/lib/utils";
import type { PipelineBucket, ChangeEventType } from "@/data/types";
import {
  TrendingUp, TrendingDown, Plus, Minus, Calendar, User,
  AlertCircle, CheckCircle, XCircle, MessageSquare, Clock,
  Activity, ArrowRight, RefreshCw,
} from "lucide-react";

type TimeFilter = "yesterday" | "7days" | "mtd";
type BucketFilter = "all" | PipelineBucket;

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 Days" },
  { value: "mtd", label: "Month to Date" },
];

const BUCKET_OPTIONS: { value: BucketFilter; label: string }[] = [
  { value: "all", label: "All Pipelines" },
  { value: "atlas", label: "Atlas" },
  { value: "renewals", label: "Renewals" },
  { value: "core", label: "Core" },
];

const eventConfig: Record<ChangeEventType, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}> = {
  DEAL_CREATED: { icon: Plus, label: "New Deal", color: "text-success-bright", bg: "bg-success-muted" },
  STAGE_CHANGED: { icon: ArrowRight, label: "Stage Move", color: "text-accent-bright", bg: "bg-accent-muted" },
  AMOUNT_CHANGED: { icon: TrendingUp, label: "Amount Change", color: "text-core-bright", bg: "bg-core-muted" },
  CLOSE_DATE_CHANGED: { icon: Calendar, label: "Close Date", color: "text-warn", bg: "bg-warn-muted" },
  OWNER_CHANGED: { icon: User, label: "Owner Change", color: "text-ink-2", bg: "bg-white/[0.05]" },
  CLOSED_WON: { icon: CheckCircle, label: "Closed Won", color: "text-success-bright", bg: "bg-success-muted" },
  CLOSED_LOST: { icon: XCircle, label: "Closed Lost", color: "text-danger-bright", bg: "bg-danger-muted" },
  MEETING_BOOKED: { icon: Calendar, label: "Meeting Booked", color: "text-atlas-bright", bg: "bg-atlas-muted" },
  NOTE_ADDED: { icon: MessageSquare, label: "Note Added", color: "text-ink-2", bg: "bg-white/[0.05]" },
  TASK_CREATED: { icon: Plus, label: "Task Created", color: "text-accent-bright", bg: "bg-accent-muted" },
  TASK_COMPLETED: { icon: CheckCircle, label: "Task Done", color: "text-success-bright", bg: "bg-success-muted" },
  ACTIVITY_LOGGED: { icon: Activity, label: "Activity", color: "text-ink-2", bg: "bg-white/[0.05]" },
  NEXT_STEP_CHANGED: { icon: ArrowRight, label: "Next Step", color: "text-accent-bright", bg: "bg-accent-muted" },
  DEAL_BECAME_STALE: { icon: AlertCircle, label: "Gone Stale", color: "text-danger-bright", bg: "bg-danger-muted" },
  DEAL_MOVED_BACKWARD: { icon: TrendingDown, label: "Moved Back", color: "text-danger-bright", bg: "bg-danger-muted" },
};

function ChangeEventCard({ event }: { event: (typeof mockChangeEvents)[0] }) {
  const cfg = eventConfig[event.eventType];
  const Icon = cfg.icon;

  return (
    <div className="card card-hover p-4 cursor-pointer">
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg flex-shrink-0 mt-0.5", cfg.bg)}>
          <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", cfg.color)}>
              {cfg.label}
            </span>
            <span className="text-ink-4">·</span>
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", bucketColor(event.pipelineBucket))}>
              {bucketLabel(event.pipelineBucket)}
            </span>
            <span className="text-[11px] text-ink-3 ml-auto">
              {new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-ink-1 leading-snug">
            {event.dealName}
          </h4>
          <p className="text-xs text-ink-3 mt-0.5">{event.companyName} · {event.ownerName}</p>

          <p className="text-sm text-ink-2 mt-2 leading-relaxed">{event.summary}</p>

          {/* Why it matters */}
          <div className="mt-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-ink-2 leading-relaxed">
              <span className="font-medium text-ink-1">Why it matters: </span>
              {event.whyItMatters}
            </p>
          </div>

          {/* Before / after */}
          {(event.previousValue || event.newValue) && (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              {event.previousValue && (
                <span className="text-xs px-2 py-0.5 rounded bg-white/[0.04] text-ink-3 line-through">
                  {event.previousValue}
                </span>
              )}
              {event.previousValue && event.newValue && (
                <ArrowRight className="w-3 h-3 text-ink-4" />
              )}
              {event.newValue && (
                <span className="text-xs px-2 py-0.5 rounded bg-success-muted text-success-bright border border-success/20">
                  {event.newValue}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WhatChangedPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("yesterday");
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>("all");

  const filtered = mockChangeEvents.filter((e) =>
    bucketFilter === "all" ? true : e.pipelineBucket === bucketFilter
  );

  const grouped = {
    atlas: filtered.filter((e) => e.pipelineBucket === "atlas"),
    renewals: filtered.filter((e) => e.pipelineBucket === "renewals"),
    core: filtered.filter((e) => e.pipelineBucket === "core"),
  };

  return (
    <div className="min-h-full">
      <PageHeader
        title="What Changed"
        subtitle="Track deal movement, activity, and signals across all pipelines"
        right={
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-ink-3" />
            <span className="text-xs text-ink-3">Live · just now</span>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="sticky top-[73px] lg:top-[77px] z-10 bg-bg-base/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Time */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-surface border border-border">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeFilter(opt.value)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  timeFilter === opt.value
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-3 hover:text-ink-1"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Bucket */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-surface border border-border">
            {BUCKET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBucketFilter(opt.value)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  bucketFilter === opt.value
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-3 hover:text-ink-1"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-ink-3 ml-auto">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
        {bucketFilter === "all" ? (
          <div className="space-y-8">
            {(["atlas", "renewals", "core"] as const).map((bucket) => {
              if (grouped[bucket].length === 0) return null;
              return (
                <section key={bucket}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      { atlas: "bg-atlas", renewals: "bg-renewals", core: "bg-core" }[bucket]
                    )} />
                    <span className={cn("section-heading", bucketColor(bucket))}>
                      {bucketLabel(bucket)} Pipeline
                    </span>
                    <span className="text-ink-4 text-xs ml-2">
                      {grouped[bucket].length} events
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {grouped[bucket].map((e) => (
                      <ChangeEventCard key={e.eventId} event={e} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((e) => (
              <ChangeEventCard key={e.eventId} event={e} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-ink-3">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No changes in this period</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
