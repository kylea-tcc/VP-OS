"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  accent?: "default" | "atlas" | "renewals" | "core" | "success" | "danger" | "warn";
  trend?: "up" | "down" | "neutral";
}

const accentMap = {
  default: { icon: "text-accent-bright", bg: "bg-accent-muted", border: "border-accent/15" },
  atlas: { icon: "text-atlas-bright", bg: "bg-atlas-muted", border: "border-atlas/15" },
  renewals: { icon: "text-renewals-bright", bg: "bg-renewals-muted", border: "border-renewals/15" },
  core: { icon: "text-core-bright", bg: "bg-core-muted", border: "border-core/15" },
  success: { icon: "text-success-bright", bg: "bg-success-muted", border: "border-success/15" },
  danger: { icon: "text-danger-bright", bg: "bg-danger-muted", border: "border-danger/15" },
  warn: { icon: "text-warn", bg: "bg-warn-muted", border: "border-warn/15" },
};

export function StatCard({ label, value, sub, icon: Icon, accent = "default", trend }: StatCardProps) {
  const a = accentMap[accent];

  return (
    <div className={cn("card p-4", a.border)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="stat-label mb-2">{label}</div>
          <div className={cn("text-2xl font-bold tabular-nums leading-none", a.icon)}>
            {value}
          </div>
          {sub && <div className="text-xs text-ink-3 mt-1.5">{sub}</div>}
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg", a.bg)}>
            <Icon className={cn("w-4 h-4", a.icon)} />
          </div>
        )}
      </div>
    </div>
  );
}
