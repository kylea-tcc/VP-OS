// ─── Pipeline Buckets ────────────────────────────────────────────────────────

export type PipelineBucket = "atlas" | "renewals" | "core";

export type ForecastCategory =
  | "commit"
  | "best_case"
  | "pipeline"
  | "omitted"
  | "closed";

export type RiskStatus = "at_risk" | "on_track" | "stalled" | "unknown";

export type DealStage =
  | "prospecting"
  | "discovery"
  | "demo_scheduled"
  | "demo_completed"
  | "proposal_sent"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

// ─── Core Deal Model (mirrors HubSpot structure) ─────────────────────────────

export interface Contact {
  contactId: string;
  name: string;
  email: string;
  title: string;
  phone?: string;
}

export interface Deal {
  dealId: string;
  dealName: string;
  companyId: string;
  companyName: string;
  ownerId: string;
  ownerName: string;
  pipelineId: string;
  pipelineName: string;
  pipelineBucket: PipelineBucket;
  dealStageId: string;
  dealStageName: string;
  stageOrder: number;
  amount: number;
  weightedAmount: number;
  closeDate: string;
  createdDate: string;
  lastModifiedDate: string;
  lastActivityDate: string;
  nextStep: string | null;
  dealType: "new_business" | "renewal" | "expansion" | "reorder";
  productLine: string;
  isAtlas: boolean;
  isRenewal: boolean;
  isCore: boolean;
  renewalDate: string | null;
  probability: number;
  forecastCategory: ForecastCategory;
  associatedContacts: Contact[];
  associatedMeetings: string[];
  associatedActivities: string[];
  recentPropertyChanges: PropertyChange[];
  personalNotes: string | null;
  riskStatus: RiskStatus;
  riskReasons: string[];
  isSaved: boolean;
}

export interface PropertyChange {
  property: string;
  previousValue: string;
  newValue: string;
  changedAt: string;
}

// ─── Change Events ────────────────────────────────────────────────────────────

export type ChangeEventType =
  | "DEAL_CREATED"
  | "STAGE_CHANGED"
  | "AMOUNT_CHANGED"
  | "CLOSE_DATE_CHANGED"
  | "OWNER_CHANGED"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "MEETING_BOOKED"
  | "NOTE_ADDED"
  | "TASK_CREATED"
  | "TASK_COMPLETED"
  | "ACTIVITY_LOGGED"
  | "NEXT_STEP_CHANGED"
  | "DEAL_BECAME_STALE"
  | "DEAL_MOVED_BACKWARD";

export interface DealChangeEvent {
  eventId: string;
  dealId: string;
  dealName: string;
  companyName: string;
  pipelineBucket: PipelineBucket;
  ownerName: string;
  eventType: ChangeEventType;
  previousValue: string | null;
  newValue: string | null;
  timestamp: string;
  summary: string;
  whyItMatters: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "waiting" | "done";
export type TaskCategory =
  | "ceo_board"
  | "team_followup"
  | "deal"
  | "strategy"
  | "admin"
  | "personal";

export interface Task {
  taskId: string;
  category: TaskCategory;
  project: string;
  title: string;
  subtasks: string[];
  impact: "high" | "medium" | "low";
  urgency: "urgent" | "normal" | "low";
  timeCommitment: string;
  dueDate: string | null;
  status: TaskStatus;
  relatedDealId: string | null;
  relatedAccount: string | null;
  notes: string | null;
  assignedTo?: string;
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export type MeetingType =
  | "atlas_demo"
  | "pipeline_followup"
  | "internal"
  | "external"
  | "renewal_review";

export interface Meeting {
  meetingId: string;
  title: string;
  type: MeetingType;
  startTime: string;
  endTime: string;
  participants: string[];
  company: string | null;
  dealId: string | null;
  ownerId: string;
  ownerName: string;
  notes: string | null;
  granolaContext: string | null;
  suggestedQuestions: string[];
  followUps: string[];
  isToday: boolean;
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export interface TeamMember {
  memberId: string;
  name: string;
  title: string;
  region: string;
  avatar: string;
  metrics: {
    meetingsBooked: number;
    atlasDemos: number;
    dealsCreated: number;
    dealsAdvanced: number;
    dealsStalled: number;
    pipeline: number;
    closedWon: number;
  };
  momentum: "up" | "steady" | "down";
  coachingSignals: string[];
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export type InsightSeverity = "critical" | "warning" | "info" | "positive";

export interface Insight {
  insightId: string;
  title: string;
  body: string;
  whyItMatters: string;
  severity: InsightSeverity;
  pipelineBucket: PipelineBucket | "all";
  relatedDealIds: string[];
  actionLabel: string | null;
  createdAt: string;
}

// ─── Integration Status ───────────────────────────────────────────────────────

export type IntegrationStatus = "connected" | "not_connected" | "error";

export interface Integration {
  name: string;
  status: IntegrationStatus;
  lastSynced: string | null;
  description: string;
}
