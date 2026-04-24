"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, right, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 bg-bg-base/80 backdrop-blur-xl border-b border-border px-6 py-4 lg:py-5",
        "pt-[calc(3.5rem+1rem)] lg:pt-5", // mobile top bar offset
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-ink-1 leading-none">{title}</h1>
          {subtitle && (
            <p className="text-sm text-ink-3 mt-1">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </div>
  );
}
