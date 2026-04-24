"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { MeetingType } from "@/data/types";
import type { EnrichedMeeting, TeamMeetingSummary } from "@/lib/hubspot/meetings";
import {
  Calendar, Users, ChevronDown, ChevronUp, RefreshCw,
  Loader2, AlertTriangle, FileText, MapPin, User,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const typeConfig: Record<MeetingType, { label: string; color: string; bg: string }> = {
  atlas_demo:        { label: "Atlas Demo",   color: "text-atlas-bright",    bg: "bg-atlas-muted border-atlas/20" },
  pipeline_followup: { label: "Follow-Up",    color: "text-accent-bright",   bg: "bg-accent-muted border-accent/20" },
  internal:          { label: "Internal",     color: "text-ink-3",           bg: "bg-white/[0.05] border-border" },
  external:          { label: "External",     color: "text-core-bright",     bg: "bg-core-muted border-core/20" },
  renewal_review:    { label: "Renewal",      color: "text-renewals-bright", bg: "bg-renewals-muted border-renewals/20" },
};

// ─── My Meeting Card ──────────────────────────────────────────────────────────

function MyMeetingCard({ m, defaultOpen }: { m: EnrichedMeeting; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const cfg = typeConfig[m.type];
  const hasIntel = !!(m.accountIntel);
  const noNotes = m.type === "atlas_demo" && !m.accountIntel && !m.notes;

  return (
    <div className={cn(
      "card overflow-hidden transition-all",
      m.isToday ? "border-accent/15" : "opacity-80"
    )}>
      {/* Header */}
      <button
        className="w-full p-4 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-3">
          {/* Time column */}
          <div className="flex-shrink-0 w-14 text-right">
            <div className="text-sm font-semibold text-ink-1 tabular-nums leading-none">
              {formatTime(m.startTime)}
            </div>
            {m.endTime && (
              <div className="text-[10px] text-ink-4 mt-0.5">
                {formatTime(m.endTime)}
              </div>
            )}
          </div>

          {/* Divider dot */}
          <div className="flex-shrink-0 flex flex-col items-center mt-1.5 gap-1">
            <div className={cn("w-2 h-2 rounded-full", {
              atlas_demo: "bg-atlas",
              pipeline_followup: "bg-accent",
              internal: "bg-ink-4",
              external: "bg-core",
              renewal_review: "bg-renewals",
            }[m.type])} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Type pill */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border", cfg.bg, cfg.color)}>
                {cfg.label}
              </span>
              {m.companyState && (
                <span className="text-[10px] text-ink-3 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {m.companyCity ? `${m.companyCity}, ${m.companyState}` : m.companyState}
                </span>
              )}
              {noNotes && (
                <span className="text-[10px] font-semibold text-danger flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> No notes
                </span>
              )}
            </div>

            {/* Company name (primary label) */}
            <h3 className="text-sm font-semibold text-ink-1 leading-snug">
              {m.title}
            </h3>

            {/* Raw invite title as subtitle if different */}
            {m.rawTitle !== m.title && (
              <p className="text-[11px] text-ink-3 mt-0.5 italic">{m.rawTitle}</p>
            )}

            {/* Participants */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <Users className="w-3 h-3 text-ink-4" />
              <span className="text-[11px] text-ink-3">
                {m.participants.slice(0, 4).join(", ")}
                {m.participants.length > 4 && ` +${m.participants.length - 4}`}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-ink-4">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-border divide-y divide-border">

          {/* Contacts */}
          {m.contactDetails.length > 0 && (
            <div className="px-4 py-3">
              <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Who You&apos;re Meeting</div>
              <div className="flex flex-col gap-1.5">
                {m.contactDetails.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-muted border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-accent-bright">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-ink-1">{c.name}</span>
                    {c.title && (
                      <>
                        <span className="text-ink-4">·</span>
                        <span className="text-xs text-ink-3">{c.title}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account intel (BDR notes) */}
          {m.accountIntel && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-3 h-3 text-core-bright" />
                <div className="text-[10px] font-semibold text-core-bright uppercase tracking-wider">Account Intel</div>
              </div>
              <div className="px-3 py-2.5 rounded-lg bg-core-muted border border-core/15">
                <p className="text-xs text-ink-2 leading-relaxed whitespace-pre-line">
                  {m.accountIntel.slice(0, 700)}
                  {m.accountIntel.length > 700 && "…"}
                </p>
              </div>
            </div>
          )}

          {/* Internal notes (Read.ai etc) */}
          {m.notes && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-3 h-3 text-accent-bright" />
                <div className="text-[10px] font-semibold text-accent-bright uppercase tracking-wider">Meeting Notes</div>
              </div>
              <div className="px-3 py-2.5 rounded-lg bg-accent-muted border border-accent/15">
                <p className="text-xs text-ink-2 leading-relaxed whitespace-pre-line">
                  {m.notes.slice(0, 500)}
                  {m.notes.length > 500 && "…"}
                </p>
              </div>
            </div>
          )}

          {/* No notes warning */}
          {noNotes && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger-muted border border-danger/20">
                <AlertTriangle className="w-3.5 h-3.5 text-danger flex-shrink-0" />
                <span className="text-xs text-danger font-medium">No BDR notes or account intel found for this demo</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Team Meeting Row ─────────────────────────────────────────────────────────

function TeamMeetingRow({ m }: { m: TeamMeetingSummary }) {
  const cfg = typeConfig[m.type];
  return (
    <div className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
      {/* Time */}
      <div className="flex-shrink-0 w-12 text-right">
        <span className="text-[11px] text-ink-3 tabular-nums">{formatTime(m.startTime)}</span>
      </div>

      {/* Type dot */}
      <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", {
        atlas_demo: "bg-atlas",
        pipeline_followup: "bg-accent",
        internal: "bg-ink-4",
        external: "bg-core",
        renewal_review: "bg-renewals",
      }[m.type])} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xs font-semibold text-ink-1 leading-snug">{m.title}</span>
          <span className={cn("text-[10px] font-medium", cfg.color)}>{cfg.label}</span>
          {m.companyState && (
            <span className="text-[10px] text-ink-4">{m.companyState}</span>
          )}
        </div>
        {m.contactDetails.length > 0 && (
          <p className="text-[11px] text-ink-3 mt-0.5">
            {m.contactDetails.map((c) => c.name + (c.title ? ` (${c.title})` : "")).join(", ")}
          </p>
        )}
      </div>

      {/* Owner */}
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-bg-elevated border border-border flex items-center justify-center" title={m.ownerName}>
          <span className="text-[9px] font-bold text-ink-3">
            {m.ownerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Team section grouped by owner ───────────────────────────────────────────

function TeamSection({ meetings, kyleId }: { meetings: TeamMeetingSummary[]; kyleId: string }) {
  const grouped = meetings
    .filter((m) => m.ownerId !== kyleId)
    .reduce<Record<string, TeamMeetingSummary[]>>((acc, m) => {
      const key = m.ownerId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {});

  const owners = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  if (owners.length === 0) return (
    <div className="card p-6 text-center">
      <Users className="w-6 h-6 mx-auto mb-2 text-ink-4" />
      <p className="text-sm text-ink-3">No team meetings logged today</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {owners.map(([ownerId, ms]) => {
        const atlasDemos = ms.filter((m) => m.type === "atlas_demo").length;
        return (
          <div key={ownerId} className="card overflow-hidden">
            {/* Owner header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/60 to-atlas/60 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {ms[0].ownerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-ink-1">{ms[0].ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                {atlasDemos > 0 && (
                  <span className="text-[10px] font-semibold text-atlas-bright px-2 py-0.5 rounded-full bg-atlas-muted border border-atlas/20">
                    {atlasDemos} demo{atlasDemos !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="text-[11px] text-ink-3">{ms.length} meeting{ms.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Their meetings */}
            <div className="divide-y divide-border">
              {ms.map((m) => <TeamMeetingRow key={m.meetingId} m={m} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "mine" | "team";

export default function MeetingsPage() {
  const [myMeetings, setMyMeetings] = useState<EnrichedMeeting[]>([]);
  const [teamMeetings, setTeamMeetings] = useState<TeamMeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("mine");
  const [typeFilter, setTypeFilter] = useState<"all" | MeetingType>("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const TYPE_FILTERS: { value: "all" | MeetingType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "atlas_demo", label: "Atlas Demos" },
    { value: "pipeline_followup", label: "Follow-Ups" },
    { value: "renewal_review", label: "Renewals" },
    { value: "external", label: "External" },
    { value: "internal", label: "Internal" },
  ];

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [myRes, teamRes] = await Promise.all([
        fetch("/api/meetings"),
        fetch("/api/meetings/team"),
      ]);
      const [myData, teamData] = await Promise.all([myRes.json(), teamRes.json()]);
      if (myData.error) throw new Error(myData.error);
      setMyMeetings(myData.meetings ?? []);
      setTeamMeetings(teamData.meetings ?? []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // My meetings — filtered + bucketed
  const filtered = myMeetings.filter((m) =>
    typeFilter === "all" ? true : m.type === typeFilter
  );
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const myToday = filtered.filter((m) => m.isToday);
  const myPast = filtered.filter((m) => !m.isToday && new Date(m.startTime) < todayStart);
  const myUpcoming = filtered.filter((m) => !m.isToday && new Date(m.startTime) >= todayStart);

  const atlasDemosToday = myMeetings.filter((m) => m.isToday && m.type === "atlas_demo").length;
  const teamDemosToday = teamMeetings.filter((m) => m.type === "atlas_demo").length;

  return (
    <div className="min-h-full">
      <PageHeader
        title="Meetings"
        subtitle="Live from HubSpot"
        right={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-atlas animate-pulse" />
              <span className="text-xs text-atlas-bright font-medium">
                {atlasDemosToday + teamDemosToday} Atlas demos today
              </span>
            </div>
            <button onClick={load} disabled={loading} className="p-1.5 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-white/[0.06] transition-colors">
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
          </div>
        }
      />

      {/* Tab + filter bar */}
      <div className="sticky top-[73px] lg:top-[77px] z-10 bg-bg-base/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-3 space-y-3">
        {/* My / Team toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-surface border border-border w-fit">
          <button
            onClick={() => setTab("mine")}
            className={cn("flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              tab === "mine" ? "bg-accent text-white" : "text-ink-3 hover:text-ink-1"
            )}
          >
            <User className="w-3.5 h-3.5" />
            My Schedule
            {myMeetings.filter((m) => m.isToday).length > 0 && (
              <span className={cn("text-[10px] px-1.5 rounded-full font-bold",
                tab === "mine" ? "bg-white/25" : "bg-white/[0.06] text-ink-3"
              )}>
                {myMeetings.filter((m) => m.isToday).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("team")}
            className={cn("flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              tab === "team" ? "bg-accent text-white" : "text-ink-3 hover:text-ink-1"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Team Today
            {teamMeetings.length > 0 && (
              <span className={cn("text-[10px] px-1.5 rounded-full font-bold",
                tab === "team" ? "bg-white/25" : "bg-white/[0.06] text-ink-3"
              )}>
                {teamMeetings.length}
              </span>
            )}
          </button>
        </div>

        {/* Type filter — only for mine */}
        {tab === "mine" && (
          <div className="flex items-center gap-1 overflow-x-auto">
            {TYPE_FILTERS.map((f) => {
              const count = f.value === "all" ? myMeetings.length : myMeetings.filter((m) => m.type === f.value).length;
              return (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                    typeFilter === f.value
                      ? "bg-accent/20 text-accent-bright border border-accent/30"
                      : "text-ink-3 hover:text-ink-1 bg-transparent"
                  )}
                >
                  {f.label}
                  {count > 0 && (
                    <span className={cn("text-[10px]", typeFilter === f.value ? "text-accent-bright" : "text-ink-4")}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
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

        {!loading && !error && tab === "mine" && (
          <div className="space-y-6">
            {/* Today */}
            {myToday.length > 0 && (
              <section>
                <div className="section-heading mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Today · {myToday.length} meeting{myToday.length !== 1 ? "s" : ""}
                </div>
                <div className="flex flex-col gap-2">
                  {myToday.map((m) => <MyMeetingCard key={m.meetingId} m={m} defaultOpen />)}
                </div>
              </section>
            )}

            {myToday.length === 0 && (
              <div className="card p-6 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-ink-4" />
                <p className="text-sm text-ink-3">Nothing on your calendar today</p>
              </div>
            )}

            {/* Yesterday */}
            {myPast.length > 0 && (
              <section>
                <div className="section-heading mb-3 text-ink-4">Yesterday</div>
                <div className="flex flex-col gap-2 opacity-55">
                  {myPast.map((m) => <MyMeetingCard key={m.meetingId} m={m} />)}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {myUpcoming.length > 0 && (
              <section>
                <div className="section-heading mb-3">Upcoming</div>
                <div className="flex flex-col gap-2">
                  {myUpcoming.map((m) => <MyMeetingCard key={m.meetingId} m={m} />)}
                </div>
              </section>
            )}

            <p className="text-[11px] text-ink-4 text-center pt-2">
              HubSpot · synced {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        )}

        {!loading && !error && tab === "team" && (
          <div className="space-y-4">
            <div className="section-heading mb-1">
              {teamMeetings.length} meetings across the team today
            </div>
            <TeamSection meetings={teamMeetings} kyleId="968887083" />
            <p className="text-[11px] text-ink-4 text-center pt-2">
              HubSpot · synced {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
