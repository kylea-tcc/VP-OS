"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockInsights, mockIntegrations } from "@/data/mock/insights";
import { cn, bucketColor, bucketLabel } from "@/lib/utils";
import type { InsightSeverity } from "@/data/types";
import {
  Lightbulb, AlertTriangle, CheckCircle, Info, TrendingUp,
  Plug, RefreshCw, ChevronRight,
} from "lucide-react";

type SeverityFilter = "all" | InsightSeverity;

const severityConfig: Record<InsightSeverity, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}> = {
  critical: {
    icon: AlertTriangle,
    label: "Critical",
    color: "text-danger-bright",
    bg: "bg-danger-muted",
    border: "border-danger/25",
    dot: "bg-danger animate-pulse",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    color: "text-warn",
    bg: "bg-warn-muted",
    border: "border-warn/20",
    dot: "bg-warn",
  },
  info: {
    icon: Info,
    label: "Info",
    color: "text-accent-bright",
    bg: "bg-accent-muted",
    border: "border-accent/20",
    dot: "bg-accent",
  },
  positive: {
    icon: TrendingUp,
    label: "Positive",
    color: "text-success-bright",
    bg: "bg-success-muted",
    border: "border-success/20",
    dot: "bg-success",
  },
};

const SEVERITY_FILTERS: { value: SeverityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warnings" },
  { value: "positive", label: "Positive" },
  { value: "info", label: "Info" },
];

function InsightCard({ insight }: { insight: (typeof mockInsights)[0] }) {
  const cfg = severityConfig[insight.severity];
  const Icon = cfg.icon;

  return (
    <div className={cn("card card-hover p-5 cursor-pointer", cfg.border)}>
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg flex-shrink-0 mt-0.5", cfg.bg)}>
          <Icon className={cn("w-4 h-4", cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", cfg.color)}>
                {cfg.label}
              </span>
            </div>
            {insight.pipelineBucket !== "all" && (
              <>
                <span className="text-ink-4">·</span>
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", bucketColor(insight.pipelineBucket))}>
                  {bucketLabel(insight.pipelineBucket)}
                </span>
              </>
            )}
          </div>

          <h3 className="text-sm font-semibold text-ink-1 leading-snug mb-2">{insight.title}</h3>
          <p className="text-xs text-ink-2 leading-relaxed">{insight.body}</p>

          {/* Why it matters */}
          <div className="mt-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-ink-2 leading-relaxed">
              <span className="font-semibold text-ink-1">Why it matters: </span>
              {insight.whyItMatters}
            </p>
          </div>

          {insight.actionLabel && (
            <div className="mt-3">
              <button className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80",
                cfg.bg, cfg.color, cfg.border
              )}>
                {insight.actionLabel}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntegrationPanel() {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Plug className="w-3.5 h-3.5 text-ink-3" />
        <span className="section-heading">Integration Status</span>
      </div>
      <div className="divide-y divide-border">
        {mockIntegrations.map((integration) => (
          <div key={integration.name} className="flex items-center gap-3 px-4 py-3">
            <div className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              integration.status === "connected" ? "bg-success animate-pulse" :
              integration.status === "error" ? "bg-danger" : "bg-ink-4"
            )} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink-1">{integration.name}</div>
              <div className="text-xs text-ink-3">{integration.description}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={cn(
                "text-[11px] font-medium px-2 py-0.5 rounded-full",
                integration.status === "connected"
                  ? "bg-success-muted text-success-bright"
                  : "bg-white/[0.05] text-ink-3"
              )}>
                {integration.status === "connected" ? "Connected" : "Not connected"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-ink-3 leading-relaxed">
          Insights are powered by mock data. Connect HubSpot, Granola, and Calendar to unlock live signal detection.
        </p>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [filter, setFilter] = useState<SeverityFilter>("all");

  const filtered = mockInsights.filter((i) =>
    filter === "all" ? true : i.severity === filter
  );

  const counts = {
    critical: mockInsights.filter((i) => i.severity === "critical").length,
    warning: mockInsights.filter((i) => i.severity === "warning").length,
    positive: mockInsights.filter((i) => i.severity === "positive").length,
    info: mockInsights.filter((i) => i.severity === "info").length,
  };

  return (
    <div className="min-h-full">
      <PageHeader
        title="Insights"
        subtitle="Plain-English signals from across your pipeline"
        right={
          <div className="flex items-center gap-1.5 text-ink-3">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs">Updated just now</span>
          </div>
        }
      />

      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto space-y-6">

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["critical", "warning", "positive", "info"] as const).map((sev) => {
            const cfg = severityConfig[sev];
            const Icon = cfg.icon;
            return (
              <button
                key={sev}
                onClick={() => setFilter(filter === sev ? "all" : sev)}
                className={cn(
                  "card p-4 text-left transition-all",
                  filter === sev && cn("border", cfg.border)
                )}
              >
                <div className={cn("p-1.5 rounded-lg w-fit mb-2", cfg.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                </div>
                <div className={cn("text-2xl font-bold tabular-nums", cfg.color)}>
                  {counts[sev]}
                </div>
                <div className="text-xs text-ink-3 mt-0.5">{cfg.label}</div>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-surface border border-border w-fit">
          {SEVERITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                filter === f.value ? "bg-accent text-white" : "text-ink-3 hover:text-ink-1"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Insight cards */}
          <div className="flex flex-col gap-3">
            {filtered.map((insight) => (
              <InsightCard key={insight.insightId} insight={insight} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-success opacity-50" />
                <p className="text-sm text-ink-3">No insights in this category</p>
              </div>
            )}
          </div>

          {/* Integration status */}
          <div className="hidden lg:block">
            <IntegrationPanel />
          </div>
        </div>

        {/* Mobile integration panel */}
        <div className="lg:hidden">
          <IntegrationPanel />
        </div>

      </div>
    </div>
  );
}
