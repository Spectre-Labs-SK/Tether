/**
 * SPECTRE LABS — TETHER
 * Edge Function: sync-workout
 * Deno runtime (Supabase Edge Functions)
 *
 * Called after a workout's sets have been inserted into workout_sets.
 * For each completed set, calculates 1RM using the Epley/Brzycki/Lander
 * consensus and upserts one_rm_history only when the new value exceeds
 * the user's existing personal best for that exercise.
 *
 * POST /functions/v1/sync-workout
 * Body: { workoutId: string; profileId: string }
 * Returns: { processed: number; newPRs: PR[]; skipped: number }
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ---------------------------------------------------------------------------
// 1RM formulas (mirrored from calculate-1rm for self-contained execution)
// ---------------------------------------------------------------------------

function epley(w: number, r: number): number {
  return r === 1 ? w : w * (1 + r / 30);
}

function brzycki(w: number, r: number): number {
  if (r === 1) return w;
  if (r >= 37) return 0;
  return w * (36 / (37 - r));
}

function lander(w: number, r: number): number {
  return r === 1 ? w : (w * 100) / (101.3 - 2.67123 * r);
}

function consensus1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0 || reps > 36) return 0;
  const avg = (epley(weightKg, reps) + brzycki(weightKg, reps) + lander(weightKg, reps)) / 3;
  return Math.round(avg * 10) / 10;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SyncBody {
  workoutId: string;
  profileId: string;
}

interface WorkoutSet {
  exercise_id: string;
  reps: number | null;
  weight_kg: number | null;
  completed: boolean;
}

interface CurrentBest {
  exercise_id: string;
  one_rm_kg: number;
}

interface PR {
  exerciseId: string;
  previousBestKg: number | null;
  newBestKg: number;
  delta: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const token = extractBearerToken(req);
  if (!token) {
    return jsonResponse({ error: 'Missing authorization token' }, 401);
  }

  let body: SyncBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { workoutId, profileId } = body;

  if (!workoutId || !profileId) {
    return jsonResponse({ error: 'workoutId and profileId are required' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Server misconfiguration: missing env vars' }, 500);
  }

  // Service role client bypasses RLS for the 1RM upsert aggregation;
  // we validate ownership explicitly via the workoutId → profileId check below.
  const db = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Verify the workout belongs to the claimed profile (ownership guard)
  const { data: workoutOwner, error: ownerError } = await db
    .from('workouts')
    .select('profile_id')
    .eq('id', workoutId)
    .single();

  if (ownerError || !workoutOwner) {
    return jsonResponse({ error: 'Workout not found' }, 404);
  }

  if (workoutOwner.profile_id !== profileId) {
    return jsonResponse({ error: 'Forbidden: workout does not belong to this profile' }, 403);
  }

  // Fetch all completed sets for this workout that have valid reps and weight
  const { data: sets, error: setsError } = await db
    .from('workout_sets')
    .select('exercise_id, reps, weight_kg, completed')
    .eq('workout_id', workoutId)
    .eq('completed', true)
    .not('reps', 'is', null)
    .not('weight_kg', 'is', null);

  if (setsError) {
    return jsonResponse({ error: `Failed to fetch sets: ${setsError.message}` }, 500);
  }

  if (!sets || sets.length === 0) {
    return jsonResponse({ processed: 0, newPRs: [], skipped: 0 });
  }

  const typedSets = sets as WorkoutSet[];

  // Build per-exercise best 1RM from this session's sets
  const sessionBestMap = new Map<string, number>();

  for (const set of typedSets) {
    if (!set.reps || !set.weight_kg) continue;
    const est = consensus1RM(set.weight_kg, set.reps);
    if (est <= 0) continue;

    const existing = sessionBestMap.get(set.exercise_id) ?? 0;
    if (est > existing) {
      sessionBestMap.set(set.exercise_id, est);
    }
  }

  const exerciseIds = [...sessionBestMap.keys()];

  if (exerciseIds.length === 0) {
    return jsonResponse({ processed: 0, newPRs: [], skipped: typedSets.length });
  }

  // Fetch current all-time bests for this profile across these exercises
  const { data: currentBests, error: bestsError } = await db
    .from('one_rm_history')
    .select('exercise_id, one_rm_kg')
    .eq('profile_id', profileId)
    .in('exercise_id', exerciseIds)
    .order('recorded_at', { ascending: false });

  if (bestsError) {
    return jsonResponse({ error: `Failed to fetch 1RM history: ${bestsError.message}` }, 500);
  }

  // Reduce to the single current best per exercise
  const allTimeBestMap = new Map<string, number>();
  for (const row of (currentBests as CurrentBest[] ?? [])) {
    if (!allTimeBestMap.has(row.exercise_id)) {
      allTimeBestMap.set(row.exercise_id, row.one_rm_kg);
    }
  }

  // Determine which exercises set a new personal record this session
  const newPRRows: { profile_id: string; exercise_id: string; one_rm_kg: number; method: string }[] = [];
  const newPRs: PR[] = [];
  let skipped = 0;

  for (const [exerciseId, sessionBest] of sessionBestMap.entries()) {
    const allTimeBest = allTimeBestMap.get(exerciseId) ?? null;

    if (allTimeBest !== null && sessionBest <= allTimeBest) {
      skipped++;
      continue;
    }

    newPRRows.push({
      profile_id: profileId,
      exercise_id: exerciseId,
      one_rm_kg: sessionBest,
      method: 'calculated',
    });

    newPRs.push({
      exerciseId,
      previousBestKg: allTimeBest,
      newBestKg: sessionBest,
      delta: allTimeBest !== null ? Math.round((sessionBest - allTimeBest) * 10) / 10 : sessionBest,
    });
  }

  if (newPRRows.length > 0) {
    const { error: insertError } = await db.from('one_rm_history').insert(newPRRows);

    if (insertError) {
      return jsonResponse({ error: `Failed to record 1RM PRs: ${insertError.message}` }, 500);
    }
  }

  return jsonResponse({
    processed: newPRRows.length,
    newPRs,
    skipped,
  });
});
