import { NextResponse } from "next/server";
import { fetchTeamMeetingsToday } from "@/lib/hubspot/meetings";

export async function GET() {
  try {
    const meetings = await fetchTeamMeetingsToday();
    return NextResponse.json({ meetings });
  } catch (err) {
    console.error("HubSpot team meetings error:", err);
    return NextResponse.json({ error: String(err), meetings: [] }, { status: 500 });
  }
}
