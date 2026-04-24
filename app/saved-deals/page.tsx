"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { savedDeals } from "@/data/mock/deals";
import { cn, formatCurrency, formatDate, daysFromNow, timeAgo, bucketColor, bucketLabel } from "@/lib/utils";
import {
  Bookmark, AlertTriangle, Clock, ArrowRight, Pencil, ChevronDown, ChevronUp,
} from "lucide-react";

function SavedDealCard({ deal }: { deal: (typeof savedDeals)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const closingIn = daysFromNow(deal.closeDate);
  const isOverdue = closingIn < 0;
  const closingSoon = closingIn <= 14 && closingIn >= 0;

  return (
    <div className="card cursor-pointer group">
      {/* Header */}
      <div
        className="p-4 hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Bucket + stage */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", bucketColor(deal.pipelineBucket))}>
                {bucketLabel(deal.pipelineBucket)}
              </span>
              <span className="text-ink-4">·</span>
              <span className="text-[11px] text-ink-3">{deal.dealStageName}</span>
              <span className="text-ink-4">·</span>
              <span className="text-[11px] text-ink-3">{deal.ownerName}</span>

              {/* Risk badge */}
              {deal.riskStatus !== "on_track" && (
                <>
                  <span className="text-ink-4">·</span>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-danger" />
                    <span className="text-[10px] font-semibold text-danger uppercase">
                      {deal.riskStatus.replace("_", " ")}
                    </span>
                  </div>
                </>
              )}
            </div>

            <h3 className="text-base font-semibold text-ink-1 leading-snug">{deal.dealName}</h3>
            <p className="text-sm text-ink-3 mt-0.5">{deal.companyName}</p>
          </div>

          {/* Amount + expand */}
          <div className="flex items-start gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-lg font-bold text-ink-1 tabular-nums">
                {formatCurrency(deal.amount)}
              </div>
              <div className="text-[11px] text-ink-3">
                {deal.probability}% prob
              </div>
            </div>
            <div className="p-1 rounded mt-1 text-ink-3">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Next step */}
        <div className="mt-3 flex items-start gap-2">
          <ArrowRight className="w-3 h-3 text-ink-4 flex-shrink-0 mt-0.5" />
          {deal.nextStep ? (
            <span className="text-xs text-ink-2 leading-snug">{deal.nextStep}</span>
          ) : (
            <span className="text-xs text-danger-bright font-medium">No next step defined</span>
          )}
        </div>

        {/* Footer row */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-ink-4" />
            <span className={cn(
              "text-xs font-medium",
              isOverdue ? "text-danger" : closingSoon ? "text-warn" : "text-ink-3"
            )}>
              {isOverdue ? `${Math.abs(closingIn)}d overdue` : `Closes ${formatDate(deal.closeDate)}`}
            </span>
          </div>
          <span className="text-ink-4">·</span>
          <span className="text-xs text-ink-3">
            Last activity {timeAgo(deal.lastActivityDate)}
          </span>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Recent changes */}
          {deal.recentPropertyChanges.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Recent Changes</div>
              <div className="flex flex-col gap-1.5">
                {deal.recentPropertyChanges.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="capitalize text-ink-2">{c.property}</span>
                    <span className="text-ink-4 line-through">{c.previousValue}</span>
                    <ArrowRight className="w-3 h-3 text-ink-4" />
                    <span className="text-success-bright font-medium">{c.newValue}</span>
                    <span className="text-ink-4 ml-auto">{formatDate(c.changedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk reasons */}
          {deal.riskReasons.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Risk Signals</div>
              <div className="flex flex-col gap-1">
                {deal.riskReasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-danger-bright">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts */}
          {deal.associatedContacts.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Contacts</div>
              <div className="flex flex-col gap-1">
                {deal.associatedContacts.map((c) => (
                  <div key={c.contactId} className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-ink-1">{c.name}</span>
                    <span className="text-ink-4">·</span>
                    <span className="text-ink-3">{c.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal note */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider">My Notes</div>
              <button className="flex items-center gap-1 text-[10px] text-ink-3 hover:text-ink-1 transition-colors">
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            </div>
            {deal.personalNotes ? (
              <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs text-ink-2 italic leading-relaxed">&ldquo;{deal.personalNotes}&rdquo;</p>
              </div>
            ) : (
              <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-dashed border-white/[0.08] flex items-center justify-center">
                <span className="text-xs text-ink-4">Add a personal note...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedDealsPage() {
  const totalValue = savedDeals.reduce((s, d) => s + d.amount, 0);
  const atRisk = savedDeals.filter((d) => d.riskStatus !== "on_track").length;

  return (
    <div className="min-h-full">
      <PageHeader
        title="Saved Deals"
        subtitle="Your personal watchlist"
        right={
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent-bright" />
            <span className="text-sm font-medium text-accent-bright">{savedDeals.length} deals</span>
          </div>
        }
      />

      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4">
            <div className="stat-label mb-1">Watching</div>
            <div className="text-2xl font-bold text-ink-1">{savedDeals.length}</div>
            <div className="text-xs text-ink-3 mt-1">deals</div>
          </div>
          <div className="card p-4">
            <div className="stat-label mb-1">Total Value</div>
            <div className="text-2xl font-bold text-ink-1 tabular-nums">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-ink-3 mt-1">combined</div>
          </div>
          <div className="card p-4 border-danger/20">
            <div className="stat-label mb-1 text-danger">At Risk</div>
            <div className="text-2xl font-bold text-danger">{atRisk}</div>
            <div className="text-xs text-ink-3 mt-1">need attention</div>
          </div>
        </div>

        {/* Deal cards */}
        <div className="flex flex-col gap-3">
          {savedDeals.map((deal) => (
            <SavedDealCard key={deal.dealId} deal={deal} />
          ))}
        </div>
      </div>
    </div>
  );
}
