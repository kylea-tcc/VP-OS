import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PipelineBucket } from "@/data/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function daysFromNow(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function daysAgo(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = now.getTime() - target.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function bucketLabel(bucket: PipelineBucket): string {
  return { atlas: "Atlas", renewals: "Renewals", core: "Core" }[bucket];
}

export function bucketColor(bucket: PipelineBucket): string {
  return {
    atlas: "text-atlas-bright",
    renewals: "text-renewals-bright",
    core: "text-core-bright",
  }[bucket];
}

export function bucketBg(bucket: PipelineBucket): string {
  return {
    atlas: "bg-atlas-muted border-atlas/20",
    renewals: "bg-renewals-muted border-renewals/20",
    core: "bg-core-muted border-core/20",
  }[bucket];
}

export function stageColor(stageOrder: number): string {
  if (stageOrder <= 2) return "text-ink-3";
  if (stageOrder === 3) return "text-core-bright";
  if (stageOrder === 4) return "text-accent-bright";
  return "text-success-bright";
}

export function timeAgo(dateStr: string): string {
  const days = daysAgo(dateStr);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
