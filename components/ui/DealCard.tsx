"use client";

import { AlertTriangle, Clock, ChevronRight, ArrowRight } from "lucide-react";
import type { Deal } from "@/data/types";
import { cn, formatCurrency, formatDate, daysFromNow, timeAgo, bucketLabel, bucketColor } from "@/lib/utils";

interface DealCardProps {
  deal: Deal;
  showPersonalNote?: boolean;
  compact?: boolean;
}

const stageDot: Record<number, string> = {
  1: "bg-ink-4",
  2: "bg-ink-3",
  3: "bg-core",
  4: "bg-accent",
  5: "bg-atlas",
  6: "bg-success",
};

export function DealCard({ deal, showPersonalNote, compact }: DealCardProps) {
  const closingIn = daysFromNow(deal.closeDate);
  const isOverdue = closingIn < 0;
  const closingSoon = closingIn <= 14 && closingIn >= 0;

  return (
    <div className="card card-hover p-4 cursor-pointer group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Bucket + stage */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                bucketColor(deal.pipelineBucket)
              )}
            >
              {bucketLabel(deal.pipelineBucket)}
            </span>
            <span className="text-ink-4">·</span>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  stageDot[deal.stageOrder] ?? "bg-ink-4"
                )}
              />
              <span className="text-[11px] text-ink-3">{deal.dealStageName}</span>
            </div>
          </div>

          {/* Deal name */}
          <h3 className="text-sm font-semibold text-ink-1 leading-snug truncate">
            {deal.dealName}
          </h3>
          <p className="text-xs text-ink-3 mt-0.5">{deal.companyName}</p>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <div className="text-base font-semibold text-ink-1 tabular-nums">
            {formatCurrency(deal.amount)}
          </div>
          <div className="text-[11px] text-ink-3">
            {deal.probability}% · {formatCurrency(deal.weightedAmount)}
          </div>
        </div>
      </div>

      {!compact && (
        <>
          {/* Next step */}
          <div className="mt-3 flex items-start gap-2">
            <ArrowRight className="w-3 h-3 text-ink-4 flex-shrink-0 mt-0.5" />
            {deal.nextStep ? (
              <span className="text-xs text-ink-2 leading-snug">{deal.nextStep}</span>
            ) : (
              <span className="text-xs text-danger-bright font-medium">No next step defined</span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-ink-3">{deal.ownerName}</span>
              <span className="text-ink-4">·</span>
              <span className="text-[11px] text-ink-3">
                Activity {timeAgo(deal.lastActivityDate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {deal.riskStatus === "at_risk" || deal.riskStatus === "stalled" ? (
                <AlertTriangle className="w-3 h-3 text-danger" />
              ) : null}
              <span
                className={cn(
                  "text-[11px] font-medium",
                  isOverdue
                    ? "text-danger"
                    : closingSoon
                    ? "text-warn"
                    : "text-ink-3"
                )}
              >
                {isOverdue
                  ? `${Math.abs(closingIn)}d overdue`
                  : closingIn === 0
                  ? "Closes today"
                  : `${closingIn}d`}
              </span>
              <Clock className="w-3 h-3 text-ink-4" />
            </div>
          </div>

          {/* Risk reasons */}
          {deal.riskReasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {deal.riskReasons.slice(0, 2).map((r, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-danger-muted text-danger-bright border border-danger/20"
                >
                  {r}
                </span>
              ))}
            </div>
          )}

          {/* Personal note */}
          {showPersonalNote && deal.personalNotes && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <p className="text-xs text-ink-2 italic leading-relaxed">
                &ldquo;{deal.personalNotes}&rdquo;
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
