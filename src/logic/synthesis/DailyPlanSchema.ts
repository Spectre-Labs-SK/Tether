export type ActivityDomain = 'iron' | 'road' | 'mat' | 'hub';
export type EventStatus = 'pending' | 'complete' | 'skipped' | 'blocked';

// Alternate suggestion surfaced for every DailyPlanEvent.
// The synthesizer guarantees this is always populated — never null.
export type DailyPlanAlternate = {
  title: string;
  domain: ActivityDomain;
  rationale: string;
};

export type IronEventData = {
  kind: 'iron';
  workoutId: string;
  name: string;
  shimmerMode: 'MILITARY' | 'ETHER';
  startedAt: string;
  finishedAt: string | null;
  totalSets: number;
  completedSets: number;
};

export type SessionEventData = {
  kind: 'road' | 'mat' | 'hub';
  workoutId: string;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  durationMinutes: number | null;
};

export type CheckpointEventData = {
  kind: 'checkpoint';
  checkpointId: string;
  opId: string;
  title: string;
  priority: 1 | 2 | 3 | 4;
  dueAt: string | null;
  checkpointStatus: 'pending' | 'in_progress' | 'complete' | 'blocked';
};

export type DailyPlanEventData = IronEventData | SessionEventData | CheckpointEventData;

export type DailyPlanEvent = {
  id: string;
  title: string;
  status: EventStatus;
  data: DailyPlanEventData;
  // Synthesizer contract: every event has a non-null alternate for the "Alternate" button.
  alternate: DailyPlanAlternate;
};

export type DailyPlanSummary = {
  totalEvents: number;
  completed: number;
  pending: number;
  blocked: number;
  skipped: number;
  topDomain: ActivityDomain | null;
  hrPeakBpm: number | null;
};

export type DailyPlan = {
  date: string;       // yyyy-mm-dd
  userId: string;
  synthesizedAt: string; // ISO timestamp
  events: DailyPlanEvent[];
  summary: DailyPlanSummary;
};
