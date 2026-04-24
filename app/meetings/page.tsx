"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockMeetings } from "@/data/mock/meetings";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { MeetingType } from "@/data/types";
import {
  Calendar, Users, Video, MessageSquare, ArrowRight,
  FileText, ChevronDown, ChevronUp, Lightbulb,
} from "lucide-react";

type TypeFilter = "all" | MeetingType;

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "atlas_demo", label: "Atlas Demos" },
  { value: "pipeline_followup", label: "Pipeline" },
  { value: "internal", label: "Internal" },
  { value: "renewal_review", label: "Renewals" },
];

const typeConfig: Record<MeetingType, { label: string; color: string; bg: string; dot: string }> = {
  atlas_demo: { label: "Atlas Demo", color: "text-atlas-bright", bg: "bg-atlas-muted border-atlas/20", dot: "bg-atlas" },
  pipeline_followup: { label: "Pipeline", color: "text-accent-bright", bg: "bg-accent-muted border-accent/20", dot: "bg-accent" },
  internal: { label: "Internal", color: "text-ink-3", bg: "bg-white/[0.05] border-border", dot: "bg-ink-4" },
  external: { label: "External", color: "text-core-bright", bg: "bg-core-muted border-core/20", dot: "bg-core" },
  renewal_review: { label: "Renewal", color: "text-renewals-bright", bg: "bg-renewals-muted border-renewals/20", dot: "bg-renewals" },
};

function MeetingCard({ meeting }: { meeting: (typeof mockMeetings)[0] }) {
  const [expanded, setExpanded] = useState(meeting.isToday);
  const cfg = typeConfig[meeting.type];

  return (
    <div className={cn(
      "card overflow-hidden",
      meeting.isToday && "border-accent/15"
    )}>
      {meeting.isToday && (
        <div className="px-4 py-1.5 bg-accent-muted border-b border-accent/15">
          <span className="text-[10px] font-semibold text-accent-bright uppercase tracking-wider">Today</span>
        </div>
      )}

      <div
        className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Type + time */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border", cfg.bg, cfg.color)}>
                {cfg.label}
              </span>
              <span className="text-xs text-ink-3">
                {formatDate(meeting.startTime)} · {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-ink-1 leading-snug">{meeting.title}</h3>
            {meeting.company && (
              <p className="text-xs text-ink-3 mt-0.5">{meeting.company}</p>
            )}

            {/* Participants */}
            <div className="flex items-center gap-1.5 mt-2">
              <Users className="w-3 h-3 text-ink-4" />
              <span className="text-[11px] text-ink-3">
                {meeting.participants.slice(0, 3).join(", ")}
                {meeting.participants.length > 3 && ` +${meeting.participants.length - 3}`}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-ink-4 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {/* Notes */}
          {meeting.notes && (
            <div className="px-4 py-3">
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-1.5">Context</div>
              <p className="text-xs text-ink-2 leading-relaxed">{meeting.notes}</p>
            </div>
          )}

          {/* Granola */}
          {meeting.granolaContext && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3 h-3 text-accent-bright" />
                <div className="text-[10px] font-semibold text-accent-bright uppercase tracking-wider">Granola Context</div>
              </div>
              <div className="px-3 py-2.5 rounded-lg bg-accent-muted border border-accent/15">
                <p className="text-xs text-ink-2 leading-relaxed">{meeting.granolaContext}</p>
              </div>
            </div>
          )}

          {/* Missing granola */}
          {!meeting.granolaContext && meeting.type === "atlas_demo" && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger-muted border border-danger/20">
                <FileText className="w-3.5 h-3.5 text-danger" />
                <span className="text-xs text-danger font-medium">No Granola context loaded for this demo</span>
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {meeting.suggestedQuestions.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3 h-3 text-core-bright" />
                <div className="text-[10px] font-semibold text-core-bright uppercase tracking-wider">Suggested Questions</div>
              </div>
              <div className="flex flex-col gap-1.5">
                {meeting.suggestedQuestions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-ink-4 mt-0.5">{i + 1}.</span>
                    <span className="text-xs text-ink-2 leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-ups */}
          {meeting.followUps.length > 0 && (
            <div className="px-4 py-3">
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-1.5">Follow-ups</div>
              <div className="flex flex-col gap-1">
                {meeting.followUps.map((fu, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-ink-4 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-ink-2">{fu}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MeetingsPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = mockMeetings.filter((m) =>
    typeFilter === "all" ? true : m.type === typeFilter
  );

  const today = filtered.filter((m) => m.isToday);
  const upcoming = filtered.filter((m) => !m.isToday);

  return (
    <div className="min-h-full">
      <PageHeader
        title="Meetings"
        subtitle="Demos, pipeline calls, and internal reviews"
        right={
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success-bright font-medium">{today.length} today</span>
          </div>
        }
      />

      {/* Filter */}
      <div className="px-4 lg:px-6 pt-5">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-surface border border-border w-fit">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                typeFilter === opt.value
                  ? "bg-accent text-white"
                  : "text-ink-3 hover:text-ink-1"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-6 py-5 max-w-3xl mx-auto space-y-6">
        {today.length > 0 && (
          <section>
            <div className="section-heading mb-3">Today</div>
            <div className="flex flex-col gap-2">
              {today.map((m) => (
                <MeetingCard key={m.meetingId} meeting={m} />
              ))}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section>
            <div className="section-heading mb-3">Upcoming</div>
            <div className="flex flex-col gap-2">
              {upcoming.map((m) => (
                <MeetingCard key={m.meetingId} meeting={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
