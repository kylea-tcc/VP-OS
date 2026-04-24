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

function classifyMeetingType(title: string | null, outcome: string | null): MeetingType {
  const t = (title ?? "").toLowerCase();
  if (t.includes("atlas demo") || t.includes("atlas demonstration") || t.includes("atlas - demo")) return "atlas_demo";
  if (t.includes("atlas follow") || t.includes("atlas check") || t.includes("atlas connect") || t.includes("atlas next")) return "pipeline_followup";
  if (t.includes("renewal") || t.includes("renew")) return "renewal_review";
  if (t.includes("internal") || t.includes("sprint") || t.includes("standup") || t.includes("connect") && !t.includes("atlas")) return "internal";
  if (t.includes("atlas")) return "pipeline_followup";
  return "external";
}

interface RawMeeting {
  id: string;
  properties: Record<string, string | null>;
}

async function batchAssociations(
  meetingIds: string[],
  toObject: "contacts" | "deals" | "companies"
): Promise<Record<string, string[]>> {
  if (meetingIds.length === 0) return {};
  const body = { inputs: meetingIds.map((id) => ({ id })) };
  const data = await hsPost(
    `/crm/v3/associations/meetings/${toObject}/batch/read`,
    body
  );
  const map: Record<string, string[]> = {};
  for (const result of data.results ?? []) {
    map[result.from.id] = (result.to ?? []).map((t: { id: string }) => t.id);
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

export async function fetchMeetings(
  daysBack = 0,
  daysForward = 30
): Promise<Meeting[]> {
  const now = Date.now();
  const startMs = now - daysBack * 86400000;
  const endMs = now + daysForward * 86400000;

  // Fetch meetings where Kyle is owner or attendee
  const [ownerResult, attendeeResult] = await Promise.all([
    hsPost("/crm/v3/objects/meetings/search", {
      filterGroups: [
        {
          filters: [
            { propertyName: "hs_meeting_start_time", operator: "GTE", value: String(startMs) },
            { propertyName: "hs_meeting_start_time", operator: "LTE", value: String(endMs) },
            { propertyName: "hubspot_owner_id", operator: "EQ", value: KYLE_OWNER_ID },
          ],
        },
      ],
      properties: MEETING_PROPS,
      sorts: [{ propertyName: "hs_meeting_start_time", direction: "ASCENDING" }],
      limit: 100,
    }),
    hsPost("/crm/v3/objects/meetings/search", {
      filterGroups: [
        {
          filters: [
            { propertyName: "hs_meeting_start_time", operator: "GTE", value: String(startMs) },
            { propertyName: "hs_meeting_start_time", operator: "LTE", value: String(endMs) },
            { propertyName: "hs_attendee_owner_ids", operator: "CONTAINS_TOKEN", value: KYLE_OWNER_ID },
          ],
        },
      ],
      properties: MEETING_PROPS,
      sorts: [{ propertyName: "hs_meeting_start_time", direction: "ASCENDING" }],
      limit: 100,
    }),
  ]);

  // Deduplicate by ID
  const seen = new Set<string>();
  const raw: RawMeeting[] = [];
  for (const m of [...(ownerResult.results ?? []), ...(attendeeResult.results ?? [])]) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      raw.push(m);
    }
  }

  raw.sort((a, b) =>
    (a.properties.hs_meeting_start_time ?? "").localeCompare(
      b.properties.hs_meeting_start_time ?? ""
    )
  );

  if (raw.length === 0) return [];

  const meetingIds = raw.map((m) => m.id);

  // Batch fetch all associations
  const [contactAssoc, dealAssoc, companyAssoc] = await Promise.all([
    batchAssociations(meetingIds, "contacts"),
    batchAssociations(meetingIds, "deals"),
    batchAssociations(meetingIds, "companies"),
  ]);

  // Collect all IDs to batch fetch
  const allContactIds = [...new Set(Object.values(contactAssoc).flat())];
  const allDealIds = [...new Set(Object.values(dealAssoc).flat())];
  const allCompanyIds = [...new Set(Object.values(companyAssoc).flat())];

  const [contacts, deals, companies] = await Promise.all([
    batchFetchObjects("contacts", allContactIds, ["firstname", "lastname", "email", "jobtitle", "phone"]),
    batchFetchObjects("deals", allDealIds, ["dealname", "dealstage", "amount", "pipeline", "closedate", "hubspot_owner_id"]),
    batchFetchObjects("companies", allCompanyIds, ["name", "domain", "state", "industry"]),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  return raw.map((m): Meeting => {
    const p = m.properties;
    const title = p.hs_meeting_title ?? "Untitled Meeting";
    const startTime = p.hs_meeting_start_time ?? "";
    const endTime = p.hs_meeting_end_time ?? "";
    const ownerId = p.hubspot_owner_id ?? "";
    const rawAttendees = p.hs_attendee_owner_ids ?? "";

    // Build participant list (owner + attendees, deduped, no Kyle if he's listed)
    const participantIds = [ownerId, ...rawAttendees.split(";").filter(Boolean)].filter(
      (id, i, arr) => arr.indexOf(id) === i
    );
    const participants = participantIds.map(ownerName).filter(Boolean);

    // Associated data
    const contactIds = contactAssoc[m.id] ?? [];
    const dealIds = dealAssoc[m.id] ?? [];
    const companyIds = companyAssoc[m.id] ?? [];

    const firstContact = contactIds[0] ? contacts[contactIds[0]] : null;
    const firstDeal = dealIds[0] ? deals[dealIds[0]] : null;
    const firstCompany = companyIds[0] ? companies[companyIds[0]] : null;

    const companyName =
      firstCompany?.name ??
      firstDeal?.dealname ??
      null;

    const startDate = new Date(startTime);
    const isToday = startDate >= todayStart && startDate <= todayEnd;

    return {
      meetingId: m.id,
      title,
      type: classifyMeetingType(title, p.hs_meeting_outcome),
      startTime,
      endTime,
      participants,
      company: companyName,
      dealId: dealIds[0] ?? null,
      ownerId,
      ownerName: ownerName(ownerId),
      notes: p.hs_meeting_body
        ? p.hs_meeting_body.replace(/<[^>]+>/g, "").slice(0, 300)
        : null,
      granolaContext: p.hs_internal_meeting_notes ?? null,
      suggestedQuestions: [],
      followUps: [],
      isToday,
    };
  });
}
