import { supabase } from '../../lib/supabase';
import type {
  ActivityDomain,
  DailyPlan,
  DailyPlanAlternate,
  DailyPlanEvent,
  DailyPlanSummary,
  EventStatus,
} from './DailyPlanSchema';

function dayBounds(date: string): { start: string; end: string } {
  return {
    start: new Date(`${date}T00:00:00.000Z`).toISOString(),
    end: new Date(`${date}T23:59:59.999Z`).toISOString(),
  };
}

// Infers activity domain from workout name. Defaults to 'iron' when ambiguous.
function inferDomain(workoutName: string): ActivityDomain {
  const n = workoutName.toLowerCase();
  if (n.includes('road') || n.includes('run') || n.includes('cardio') || n.includes('cycle')) return 'road';
  if (n.includes('mat') || n.includes('yoga') || n.includes('flow')) return 'mat';
  if (n.includes('hub') || n.includes('desk') || n.includes('stand')) return 'hub';
  return 'iron';
}

// One alternate per domain — maps to a different domain so the user always has
// a valid fallback that doesn't require the same equipment or environment.
const DOMAIN_ALTERNATES: Record<ActivityDomain, DailyPlanAlternate> = {
  iron: { title: 'Bodyweight AMRAP', domain: 'mat', rationale: 'No equipment required — maintains movement pattern.' },
  road: { title: 'Recovery Walk', domain: 'hub', rationale: 'Low-impact — preserves aerobic base without load.' },
  mat:  { title: 'Desk Mobility Reset', domain: 'hub', rationale: 'Minimal floor space — zero downtime cost.' },
  hub:  { title: 'Standing Flow', domain: 'mat', rationale: '5-min mobility — no equipment, can be done at desk.' },
};

const CHECKPOINT_ALTERNATE: DailyPlanAlternate = {
  title: 'Defer to Next Cycle',
  domain: 'hub',
  rationale: 'Push to next daily plan synthesis — priority preserved.',
};

function computeTopDomain(events: DailyPlanEvent[]): ActivityDomain | null {
  const counts: Record<ActivityDomain, number> = { iron: 0, road: 0, mat: 0, hub: 0 };
  for (const e of events) {
    if (e.data.kind !== 'checkpoint') {
      counts[e.data.kind as ActivityDomain]++;
    }
  }
  return (
    (Object.entries(counts) as [ActivityDomain, number][])
      .sort((a, b) => b[1] - a[1])
      .find(([, n]) => n > 0)?.[0] ?? null
  );
}

/**
 * Aggregates a user's activity data for a given date from Supabase and
 * returns a DailyPlan where every event carries a non-null alternate.
 * @param userId - Supabase profile id (auth.uid())
 * @param date   - ISO date string: yyyy-mm-dd
 */
export async function synthesizeDay(userId: string, date: string): Promise<DailyPlan> {
  const { start, end } = dayBounds(date);
  const events: DailyPlanEvent[] = [];

  // --- Workouts ---
  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, name, shimmer_mode, started_at, finished_at')
    .eq('profile_id', userId)
    .gte('started_at', start)
    .lte('started_at', end);

  for (const w of workouts ?? []) {
    const domain = inferDomain(w.name as string);
    const status: EventStatus = w.finished_at ? 'complete' : 'pending';

    if (domain === 'iron') {
      const { data: sets } = await supabase
        .from('workout_sets')
        .select('id, completed')
        .eq('workout_id', w.id);

      events.push({
        id: w.id as string,
        title: w.name as string,
        status,
        data: {
          kind: 'iron',
          workoutId: w.id as string,
          name: w.name as string,
          shimmerMode: (w.shimmer_mode ?? 'MILITARY') as 'MILITARY' | 'ETHER',
          startedAt: w.started_at as string,
          finishedAt: (w.finished_at as string | null) ?? null,
          totalSets: sets?.length ?? 0,
          completedSets: sets?.filter((s) => s.completed).length ?? 0,
        },
        alternate: DOMAIN_ALTERNATES.iron,
      });
    } else {
      const durationMinutes =
        w.finished_at
          ? Math.round(
              (new Date(w.finished_at as string).getTime() -
                new Date(w.started_at as string).getTime()) /
                60000,
            )
          : null;

      events.push({
        id: w.id as string,
        title: w.name as string,
        status,
        data: {
          kind: domain,
          workoutId: w.id as string,
          name: w.name as string,
          startedAt: w.started_at as string,
          finishedAt: (w.finished_at as string | null) ?? null,
          durationMinutes,
        },
        alternate: DOMAIN_ALTERNATES[domain],
      });
    }
  }

  // --- Op Checkpoints due today ---
  const { data: checkpoints } = await supabase
    .from('op_checkpoints')
    .select('id, op_id, title, priority, due_at, status')
    .eq('assigned_to', userId)
    .gte('due_at', start)
    .lte('due_at', end);

  for (const cp of checkpoints ?? []) {
    const cpStatus = cp.status as 'pending' | 'in_progress' | 'complete' | 'blocked';
    const eventStatus: EventStatus =
      cpStatus === 'complete' ? 'complete' : cpStatus === 'blocked' ? 'blocked' : 'pending';

    events.push({
      id: cp.id as string,
      title: cp.title as string,
      status: eventStatus,
      data: {
        kind: 'checkpoint',
        checkpointId: cp.id as string,
        opId: cp.op_id as string,
        title: cp.title as string,
        priority: cp.priority as 1 | 2 | 3 | 4,
        dueAt: (cp.due_at as string | null) ?? null,
        checkpointStatus: cpStatus,
      },
      alternate: CHECKPOINT_ALTERNATE,
    });
  }

  // --- HR peak ---
  const { data: hrPeak } = await supabase
    .from('hr_readings')
    .select('bpm')
    .eq('profile_id', userId)
    .gte('recorded_at', start)
    .lte('recorded_at', end)
    .order('bpm', { ascending: false })
    .limit(1);

  const summary: DailyPlanSummary = {
    totalEvents: events.length,
    completed: events.filter((e) => e.status === 'complete').length,
    pending: events.filter((e) => e.status === 'pending').length,
    blocked: events.filter((e) => e.status === 'blocked').length,
    skipped: events.filter((e) => e.status === 'skipped').length,
    topDomain: computeTopDomain(events),
    hrPeakBpm: (hrPeak?.[0]?.bpm as number | undefined) ?? null,
  };

  return {
    date,
    userId,
    synthesizedAt: new Date().toISOString(),
    events,
    summary,
  };
}
