import { NextResponse } from "next/server";
import { fetchMeetings } from "@/lib/hubspot/meetings";

export async function GET() {
  try {
    const meetings = await fetchMeetings(1, 30); // yesterday + 30 days forward
    return NextResponse.json({ meetings });
  } catch (err) {
    console.error("HubSpot meetings error:", err);
    return NextResponse.json(
      { error: String(err), meetings: [] },
      { status: 500 }
    );
  }
}
