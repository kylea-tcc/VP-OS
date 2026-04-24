import { hsPost, hsGet } from "./client";
import { ownerName, attendeeNames, KYLE_OWNER_ID } from "./owners";
import type { Meeting, MeetingType } from "@/data/types";

const MEETING_PROPS = [
  "hs_meeting_title",
  "hs_meeting_start_time",
  "hs_meeting_end_time",
  "hs_meeting_outcome",
  "hs_meeting_body",
  "hs_attendee_owner_ids",
  "hs_internal_meeting_notes",
  "hs_meeting_location",
  "hubspot_owner_id",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function classifyMeetingType(title: string | null): MeetingType {
  const t = (title ?? "").toLowerCase();
  if (t.includes("atlas demo") || t.includes("atlas demonstration") || t.includes("atlas - demo")) return "atlas_demo";
  if (t.includes("atlas follow") || t.includes("atlas check") || t.includes("atlas connect") || t.includes("atlas next") || t.includes("atlas proposal") || t.includes("atlas success") || t.includes("atlas executive")) return "pipeline_followup";
  if (t.includes("renewal") || t.includes("renew")) return "renewal_review";
  if (t.includes("atlas")) return "pipeline_followup";
  if (t.includes("sprint") || t.includes("standup") || t.includes("weekly") || t.includes("1:1") || t.includes("check in") || t.includes("check-in")) return "internal";
  return "external";
}

// Pick the most useful note for an account — prefer structured BDR notes
function pickBestNote(notes: string[]): string | null {
  if (notes.length === 0) return null;
  const keywords = ["why they took", "anticipated use", "attendees", "landmine", "red flag", "tldr", "atlas", "current usage", "use case"];
  const scored = notes.map((n) => {
    const lower = n.toLowerCase();
    const score = keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
    return { note: n, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  // Return the top note if it has any signal, otherwise most recent
  return (best.score > 0 ? best.note : notes[0]) ?? null;
}

async function fetchCompanyNotes(companyId: string): Promise<string | null> {
  try {
    const data = await hsGet(
      `/engagements/v1/engagements/associated/company/${companyId}/paged?limit=20&engagementType=NOTE`
    );
    const notes: string[] = (data.results ?? [])
      .filter((e: { engagement: { type: string }; metadata: { body?: string } }) =>
        e.engagement.type === "NOTE" && e.metadata?.body
      )
      .map((e: { metadata: { body: string } }) => stripHtml(e.metadata.body).slice(0, 800))
      .filter((n: string) => n.length > 30);

    return pickBestNote(notes);
  } catch {
    return null;
  }
}

// ─── Association batch fetchers ───────────────────────────────────────────────

interface AssocResult { from: { id: string }; to: { id: string }[] }

async function batchAssociations(
  meetingIds: string[],
  toObject: "contacts" | "deals" | "companies"
): Promise<Record<string, string[]>> {
  if (meetingIds.length === 0) return {};
  const data = await hsPost(`/crm/v3/associations/meetings/${toObject}/batch/read`, {
    inputs: meetingIds.map((id) => ({ id })),
  });
  const map: Record<string, string[]> = {};
  for (const result of (data.results ?? []) as AssocResult[]) {
    map[result.from.id] = (result.to ?? []).map((t) => t.id);
  }
  return map;
}

async function batchFetchObjects(
  objectType: "contacts" | "deals" | "companies",
  ids: string[],
  properties: string[]
): Promise<Record<string, Record<string, string | null>>> {
  if (ids.length === 0) return {};
  const unique = [...new Set(ids)];
  const data = await hsPost(`/crm/v3/objects/${objectType}/batch/read`, {
    inputs: unique.map((id) => ({ id })),
    properties,
  });
  const map: Record<string, Record<string, string | null>> = {};
  for (const result of data.results ?? []) {
    map[result.id] = result.properties;
  }
  return map;
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface EnrichedMeeting extends Meeting {
  accountIntel: string | null;
  contactDetails: { name: string; title: string | null; email: string | null }[];
  rawTitle: string;
  companyState: string | null;
  companyCity: string | null;
}

// ─── Main fetch: Kyle's meetings ──────────────────────────────────────────────

export async function fetchMyMeetings(
  daysBack = 1,
  daysForward = 30
): Promise<EnrichedMeeting[]> {
  const now = Date.now();
  const startMs = now - daysBack * 86400000;
  const endMs = now + daysForward * 86400000;

  const [ownerResult, attendeeResult] = await Promise.all([
    hsPost("/crm/v3/objects/meetings/search", {
      filterGroups: [{
        filters: [
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: String(startMs) },
          { propertyName: "hs_meeting_start_time", operator: "LTE", value: String(endMs) },
          { propertyName: "hubspot_owner_id", operator: "EQ", value: KYLE_OWNER_ID },
        ],
      }],
      properties: MEETING_PROPS,
      sorts: [{ propertyName: "hs_meeting_start_time", direction: "ASCENDING" }],
      limit: 100,
    }),
    hsPost("/crm/v3/objects/meetings/search", {
      filterGroups: [{
        filters: [
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: String(startMs) },
          { propertyName: "hs_meeting_start_time", operator: "LTE", value: String(endMs) },
          { propertyName: "hs_attendee_owner_ids", operator: "CONTAINS_TOKEN", value: KYLE_OWNER_ID },
        ],
      }],
      properties: MEETING_PROPS,
      sorts: [{ propertyName: "hs_meeting_start_time", direction: "ASCENDING" }],
      limit: 100,
    }),
  ]);

  // Deduplicate
  const seen = new Set<string>();
  const raw: { id: string; properties: Record<string, string | null> }[] = [];
  for (const m of [...(ownerResult.results ?? []), ...(attendeeResult.results ?? [])]) {
    if (!seen.has(m.id)) { seen.add(m.id); raw.push(m); }
  }
  raw.sort((a, b) =>
    (a.properties.hs_meeting_start_time ?? "").localeCompare(b.properties.hs_meeting_start_time ?? "")
  );
  if (raw.length === 0) return [];

  const meetingIds = raw.map((m) => m.id);

  const [contactAssoc, dealAssoc, companyAssoc] = await Promise.all([
    batchAssociations(meetingIds, "contacts"),
    batchAssociations(meetingIds, "deals"),
    batchAssociations(meetingIds, "companies"),
  ]);

  const allContactIds = [...new Set(Object.values(contactAssoc).flat())];
  const allCompanyIds = [...new Set(Object.values(companyAssoc).flat())];

  const [contacts, companies] = await Promise.all([
    batchFetchObjects("contacts", allContactIds, ["firstname", "lastname", "email", "jobtitle"]),
    batchFetchObjects("companies", allCompanyIds, ["name", "domain", "state", "city", "industry"]),
  ]);

  // Fetch company notes in parallel (only for the first/primary company per meeting)
  const primaryCompanyIds = meetingIds
    .map((id) => (companyAssoc[id] ?? [])[0])
    .filter(Boolean) as string[];
  const uniqueCompanyIds = [...new Set(primaryCompanyIds)];

  const companyNotes: Record<string, string | null> = {};
  await Promise.all(
    uniqueCompanyIds.map(async (cid) => {
      companyNotes[cid] = await fetchCompanyNotes(cid);
    })
  );

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  return raw.map((m): EnrichedMeeting => {
    const p = m.properties;
    const rawTitle = p.hs_meeting_title ?? "Untitled Meeting";
    const ownerId = p.hubspot_owner_id ?? "";
    const rawAttendees = p.hs_attendee_owner_ids ?? "";

    const participantIds = [ownerId, ...rawAttendees.split(";").filter(Boolean)]
      .filter((id, i, arr) => arr.indexOf(id) === i);
    const participants = participantIds.map(ownerName).filter(Boolean);

    const contactIds = contactAssoc[m.id] ?? [];
    const companyIds = companyAssoc[m.id] ?? [];
    const firstCompanyId = companyIds[0];
    const firstCompany = firstCompanyId ? companies[firstCompanyId] : null;

    // Display name: company name (never show "The Change Companies" as primary)
    const companyName = firstCompany?.name &&
      !firstCompany.name.toLowerCase().includes("the change compan")
        ? firstCompany.name
        : companyIds.slice(1).map((id) => companies[id]?.name).find((n) => n && !n.toLowerCase().includes("the change compan")) ?? null;

    const contactDetails = contactIds.slice(0, 4).map((cid) => {
      const c = contacts[cid];
      return {
        name: [c?.firstname, c?.lastname].filter(Boolean).join(" ") || "Unknown",
        title: c?.jobtitle ?? null,
        email: c?.email ?? null,
      };
    });

    const startDate = new Date(p.hs_meeting_start_time ?? "");
    const isToday = startDate >= todayStart && startDate <= todayEnd;

    const internalNotes = p.hs_internal_meeting_notes
      ? stripHtml(p.hs_internal_meeting_notes).slice(0, 600)
      : null;

    return {
      meetingId: m.id,
      title: companyName ?? rawTitle,
      rawTitle,
      type: classifyMeetingType(rawTitle),
      startTime: p.hs_meeting_start_time ?? "",
      endTime: p.hs_meeting_end_time ?? "",
      participants,
      company: companyName,
      companyState: firstCompany?.state ?? null,
      companyCity: firstCompany?.city ?? null,
      dealId: (dealAssoc[m.id] ?? [])[0] ?? null,
      ownerId,
      ownerName: ownerName(ownerId),
      notes: internalNotes,
      granolaContext: null,
      suggestedQuestions: [],
      followUps: [],
      isToday,
      accountIntel: firstCompanyId ? (companyNotes[firstCompanyId] ?? null) : null,
      contactDetails,
    };
  });
}

// ─── Team meetings: all owners, today only ────────────────────────────────────

export interface TeamMeetingSummary {
  meetingId: string;
  title: string;
  company: string | null;
  companyState: string | null;
  type: MeetingType;
  startTime: string;
  endTime: string;
  ownerId: string;
  ownerName: string;
  outcome: string | null;
  contactDetails: { name: string; title: string | null }[];
}

export async function fetchTeamMeetingsToday(): Promise<TeamMeetingSummary[]> {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const data = await hsPost("/crm/v3/objects/meetings/search", {
    filterGroups: [{
      filters: [
        { propertyName: "hs_meeting_start_time", operator: "GTE", value: String(todayStart.getTime()) },
        { propertyName: "hs_meeting_start_time", operator: "LTE", value: String(todayEnd.getTime()) },
      ],
    }],
    properties: ["hs_meeting_title", "hs_meeting_start_time", "hs_meeting_end_time", "hubspot_owner_id", "hs_attendee_owner_ids", "hs_meeting_outcome"],
    sorts: [{ propertyName: "hs_meeting_start_time", direction: "ASCENDING" }],
    limit: 200,
  });

  const raw: { id: string; properties: Record<string, string | null> }[] = data.results ?? [];

  // Exclude untitled/null meetings and purely internal ones
  const filtered = raw.filter((m) => m.properties.hs_meeting_title);

  const meetingIds = filtered.map((m) => m.id);
  const [contactAssoc, companyAssoc] = await Promise.all([
    batchAssociations(meetingIds, "contacts"),
    batchAssociations(meetingIds, "companies"),
  ]);

  const allContactIds = [...new Set(Object.values(contactAssoc).flat())];
  const allCompanyIds = [...new Set(Object.values(companyAssoc).flat())];

  const [contacts, companies] = await Promise.all([
    batchFetchObjects("contacts", allContactIds, ["firstname", "lastname", "jobtitle"]),
    batchFetchObjects("companies", allCompanyIds, ["name", "state"]),
  ]);

  return filtered.map((m): TeamMeetingSummary => {
    const p = m.properties;
    const rawTitle = p.hs_meeting_title ?? "Untitled";
    const companyIds = companyAssoc[m.id] ?? [];
    const firstCompany = companyIds[0] ? companies[companyIds[0]] : null;
    const companyName = firstCompany?.name &&
      !firstCompany.name.toLowerCase().includes("the change compan")
        ? firstCompany.name : null;

    const contactIds = contactAssoc[m.id] ?? [];
    const contactDetails = contactIds.slice(0, 2).map((cid) => {
      const c = contacts[cid];
      return {
        name: [c?.firstname, c?.lastname].filter(Boolean).join(" ") || "Unknown",
        title: c?.jobtitle ?? null,
      };
    });

    return {
      meetingId: m.id,
      title: companyName ?? rawTitle,
      company: companyName,
      companyState: firstCompany?.state ?? null,
      type: classifyMeetingType(rawTitle),
      startTime: p.hs_meeting_start_time ?? "",
      endTime: p.hs_meeting_end_time ?? "",
      ownerId: p.hubspot_owner_id ?? "",
      ownerName: ownerName(p.hubspot_owner_id),
      outcome: p.hs_meeting_outcome ?? null,
      contactDetails,
    };
  });
}
