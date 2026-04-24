"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DealCard } from "@/components/ui/DealCard";
import { dealsByBucket, getPipelineSummary } from "@/data/mock/deals";
import { cn, formatCurrency, bucketColor } from "@/lib/utils";
import { BarChart3, AlertTriangle, TrendingUp, Target, ChevronRight } from "lucide-react";
import type { PipelineBucket } from "@/data/types";

type Tab = PipelineBucket;

const TABS: { value: Tab; label: string }[] = [
  { value: "atlas", label: "Atlas" },
  { value: "renewals", label: "Renewals" },
  { value: "core", label: "Core" },
];

const stageOrder = ["Prospecting", "Discovery", "Demo Scheduled", "Demo Completed", "Proposal Sent", "Negotiation"];

function StageBar({ deals }: { deals: (typeof dealsByBucket)["atlas"] }) {
  const byStageName = deals.reduce<Record<string, { count: number; amount: number }>>((acc, d) => {
    const s = d.dealStageName;
    if (!acc[s]) acc[s] = { count: 0, amount: 0 };
    acc[s].count += 1;
    acc[s].amount += d.amount;
    return acc;
  }, {});

  const total = deals.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="card p-4">
      <div className="section-heading mb-4">Pipeline by Stage</div>
      <div className="space-y-3">
        {Object.entries(byStageName)
          .sort((a, b) => {
            const ai = stageOrder.indexOf(a[0]);
            const bi = stageOrder.indexOf(b[0]);
            return (bi === -1 ? 99 : bi) - (ai === -1 ? 99 : ai);
          })
          .map(([stage, data]) => {
            const pct = total > 0 ? (data.amount / total) * 100 : 0;
            return (
              <div key={stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-ink-2">{stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ink-3">{data.count} deal{data.count !== 1 ? "s" : ""}</span>
                    <span className="text-xs font-medium text-ink-1 tabular-nums">
                      {formatCurrency(data.amount)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function OwnerTable({ deals }: { deals: (typeof dealsByBucket)["atlas"] }) {
  const byOwner = deals.reduce<Record<string, { name: string; count: number; amount: number; weighted: number }>>((acc, d) => {
    if (!acc[d.ownerId]) acc[d.ownerId] = { name: d.ownerName, count: 0, amount: 0, weighted: 0 };
    acc[d.ownerId].count += 1;
    acc[d.ownerId].amount += d.amount;
    acc[d.ownerId].weighted += d.weightedAmount;
    return acc;
  }, {});

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <span className="section-heading">Pipeline by Owner</span>
      </div>
      <div className="divide-y divide-border">
        {Object.values(byOwner)
          .sort((a, b) => b.amount - a.amount)
          .map((row) => (
            <div key={row.name} className="flex items-center px-4 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="w-7 h-7 rounded-full bg-accent-muted border border-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-accent-bright">
                  {row.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <span className="ml-3 text-sm text-ink-1 flex-1">{row.name}</span>
              <div className="text-right">
                <div className="text-sm font-semibold text-ink-1 tabular-nums">{formatCurrency(row.amount)}</div>
                <div className="text-[11px] text-ink-3">{row.count} deals · {formatCurrency(row.weighted)} wtd</div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-4 ml-3" />
            </div>
          ))}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [activeTab, setActiveTab] = useState<Tab>("atlas");
  const deals = dealsByBucket[activeTab];
  const summary = getPipelineSummary(activeTab);

  const tabAccent = { atlas: "atlas", renewals: "renewals", core: "core" } as const;

  return (
    <div className="min-h-full">
      <PageHeader
        title="Pipeline"
        subtitle="Total pipeline across Atlas, Renewals, and Core"
      />

      {/* Tabs */}
      <div className="px-4 lg:px-6 pt-5">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-surface border border-border w-fit">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const colorMap = {
              atlas: isActive ? "bg-atlas text-white" : "text-ink-3 hover:text-atlas-bright",
              renewals: isActive ? "bg-renewals text-white" : "text-ink-3 hover:text-renewals-bright",
              core: isActive ? "bg-core text-white" : "text-ink-3 hover:text-core-bright",
            };
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                  colorMap[tab.value]
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 lg:px-6 py-5 max-w-5xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Pipeline"
            value={formatCurrency(summary.totalPipeline)}
            sub={`${summary.totalDeals} active deals`}
            icon={BarChart3}
            accent={tabAccent[activeTab]}
          />
          <StatCard
            label="Weighted Pipeline"
            value={formatCurrency(summary.weightedPipeline)}
            sub="Probability-adjusted"
            icon={TrendingUp}
            accent={tabAccent[activeTab]}
          />
          <StatCard
            label="Commit"
            value={formatCurrency(summary.commitPipeline)}
            sub="Commit-category deals"
            icon={Target}
            accent="success"
          />
          <StatCard
            label="At Risk"
            value={`${summary.atRisk + summary.stalled}`}
            sub={`${summary.noNextStep} no next step`}
            icon={AlertTriangle}
            accent="danger"
          />
        </div>

        {/* Stage breakdown + owner table */}
        <div className="grid lg:grid-cols-2 gap-4">
          <StageBar deals={deals} />
          <OwnerTable deals={deals} />
        </div>

        {/* Risky deals */}
        {(summary.atRisk > 0 || summary.stalled > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-danger" />
              <span className="section-heading text-danger">Risky Deals</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-3">
              {deals
                .filter((d) => d.riskStatus !== "on_track")
                .map((deal) => (
                  <DealCard key={deal.dealId} deal={deal} showPersonalNote />
                ))}
            </div>
          </section>
        )}

        {/* All deals */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("section-heading", bucketColor(activeTab))}>All {activeTab === "atlas" ? "Atlas" : activeTab === "renewals" ? "Renewal" : "Core"} Deals</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            {deals
              .filter((d) => d.riskStatus === "on_track" || d.riskStatus === "unknown")
              .map((deal) => (
                <DealCard key={deal.dealId} deal={deal} />
              ))}
          </div>
        </section>

      </div>
    </div>
  );
}
