"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { Meeting, MeetingType } from "@/data/types";
import {
  Calendar, Users, ArrowRight, FileText, ChevronDown, ChevronUp,
  Lightbulb, RefreshCw, Loader2, AlertTriangle,
} from "lucide-react";

type TypeFilter = "all" | MeetingType;

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "atlas_demo", label: "Atlas Demos" },
  { value: "pipeline_followup", label: "Pipeline" },
  { value: "internal", label: "Internal" },
  { value: "renewal_review", label: "Renewals" },
  { value: "external", label: "External" },
];

const typeConfig: Record<MeetingType, { label: string; color: string; bg: string }> = {
  atlas_demo: { label: "Atlas Demo", color: "text-atlas-bright", bg: "bg-atlas-muted border-atlas/20" },
  pipeline_followup: { label: "Pipeline", color: "text-accent-bright", bg: "bg-accent-muted border-accent/20" },
  internal: { label: "Internal", color: "text-ink-3", bg: "bg-white/[0.05] border-border" },
  external: { label: "External", color: "text-core-bright", bg: "bg-core-muted border-core/20" },
  renewal_review: { label: "Renewal", color: "text-renewals-bright", bg: "bg-renewals-muted border-renewals/20" },
};

const outcomeConfig: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Scheduled", color: "text-accent-bright" },
  COMPLETED: { label: "Completed", color: "text-success-bright" },
  CONNECTED: { label: "Connected", color: "text-success-bright" },
  RESCHEDULED: { label: "Rescheduled", color: "text-warn" },
  NO_SHOW: { label: "No Show", color: "text-danger-bright" },
  CANCELLED: { label: "Cancelled", color: "text-danger-bright" },
};

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const [expanded, setExpanded] = useState(meeting.isToday);
  const cfg = typeConfig[meeting.type];
  const outcome = meeting.notes?.includes("OUTCOME:") ? null :
    (meeting as unknown as { outcome?: string }).outcome;

  return (
    <div className={cn("card overflow-hidden", meeting.isToday && "border-accent/15")}>
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
                {formatDate(meeting.startTime)} · {formatTime(meeting.startTime)}
                {meeting.endTime && ` – ${formatTime(meeting.endTime)}`}
              </span>
              <span className="text-xs text-ink-3">· {meeting.ownerName}</span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-ink-1 leading-snug">{meeting.title}</h3>
            {meeting.company && (
              <p className="text-xs text-ink-3 mt-0.5">{meeting.company}</p>
            )}

            {/* Participants */}
            {meeting.participants.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Users className="w-3 h-3 text-ink-4" />
                <span className="text-[11px] text-ink-3">
                  {meeting.participants.slice(0, 4).join(", ")}
                  {meeting.participants.length > 4 && ` +${meeting.participants.length - 4}`}
                </span>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 text-ink-4 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {/* Meeting notes / body */}
          {meeting.notes && (
            <div className="px-4 py-3">
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-1.5">Notes</div>
              <p className="text-xs text-ink-2 leading-relaxed whitespace-pre-line">
                {meeting.notes.trim().slice(0, 400)}
                {meeting.notes.length > 400 && "…"}
              </p>
            </div>
          )}

          {/* Granola / internal notes */}
          {meeting.granolaContext ? (
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3 h-3 text-accent-bright" />
                <div className="text-[10px] font-semibold text-accent-bright uppercase tracking-wider">Internal Notes</div>
              </div>
              <div className="px-3 py-2.5 rounded-lg bg-accent-muted border border-accent/15">
                <p className="text-xs text-ink-2 leading-relaxed">{meeting.granolaContext}</p>
              </div>
            </div>
          ) : meeting.type === "atlas_demo" ? (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger-muted border border-danger/20">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                <span className="text-xs text-danger font-medium">No internal notes for this demo</span>
              </div>
            </div>
          ) : null}

          {/* Deal link */}
          {meeting.dealId && (
            <div className="px-4 py-3 flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-ink-4" />
              <span className="text-xs text-ink-3">Deal ID: {meeting.dealId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMeetings(data.meetings ?? []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = meetings.filter((m) =>
    typeFilter === "all" ? true : m.type === typeFilter
  );

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const today = filtered.filter((m) => m.isToday);
  const past = filtered.filter((m) => !m.isToday && new Date(m.startTime) < todayStart);
  const upcoming = filtered.filter((m) => !m.isToday && new Date(m.startTime) >= todayStart);

  const atlasDemosToday = meetings.filter((m) => m.isToday && m.type === "atlas_demo").length;
  const totalToday = meetings.filter((m) => m.isToday).length;

  return (
    <div className="min-h-full">
      <PageHeader
        title="Meetings"
        subtitle="Demos, pipeline calls, and reviews — live from HubSpot"
        right={
          <div className="flex items-center gap-3">
            {totalToday > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success-bright font-medium">{totalToday} today</span>
                {atlasDemosToday > 0 && (
                  <span className="text-xs text-atlas-bright">· {atlasDemosToday} Atlas demos</span>
                )}
              </div>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="p-1.5 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-white/[0.06] transition-colors"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
          </div>
        }
      />

      {/* Filter */}
      <div className="px-4 lg:px-6 pt-5">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-surface border border-border overflow-x-auto">
          {TYPE_OPTIONS.map((opt) => {
            const count = opt.value === "all"
              ? meetings.length
              : meetings.filter((m) => m.type === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                  typeFilter === opt.value
                    ? "bg-accent text-white"
                    : "text-ink-3 hover:text-ink-1"
                )}
              >
                {opt.label}
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] px-1 rounded",
                    typeFilter === opt.value ? "bg-white/20" : "bg-white/[0.06] text-ink-4"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-20 text-ink-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading from HubSpot…</span>
          </div>
        )}

        {error && (
          <div className="card border-danger/20 p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-danger">Failed to load meetings</p>
              <p className="text-xs text-ink-3 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {today.length > 0 && (
              <section>
                <div className="section-heading mb-3">Today</div>
                <div className="flex flex-col gap-2">
                  {today.map((m) => <MeetingCard key={m.meetingId} meeting={m} />)}
                </div>
              </section>
            )}

            {today.length === 0 && !loading && (
              <div className="card p-6 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-ink-4" />
                <p className="text-sm text-ink-3">No meetings for you today</p>
              </div>
            )}

            {past.length > 0 && (
              <section>
                <div className="section-heading mb-3 text-ink-4">Yesterday</div>
                <div className="flex flex-col gap-2 opacity-60">
                  {past.map((m) => <MeetingCard key={m.meetingId} meeting={m} />)}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <div className="section-heading mb-3">Upcoming</div>
                <div className="flex flex-col gap-2">
                  {upcoming.map((m) => <MeetingCard key={m.meetingId} meeting={m} />)}
                </div>
              </section>
            )}

            <p className="text-[11px] text-ink-4 text-center pt-2">
              Showing meetings from HubSpot · Last synced {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
