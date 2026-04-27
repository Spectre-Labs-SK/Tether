/**
 * SPECTRE LABS — TETHER
 * Edge Function: calculate-1rm
 * Deno runtime (Supabase Edge Functions)
 *
 * POST /functions/v1/calculate-1rm
 * Body: { weightKg: number; reps: number }
 * Returns: { epley: number; brzycki: number; lander: number; consensus: number; method: string }
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  weightKg: number;
  reps: number;
}

interface OneRMResult {
  epley: number;
  brzycki: number;
  lander: number;
  consensus: number;
  method: 'calculated' | 'tested';
}

function roundTo1(n: number): number {
  return Math.round(n * 10) / 10;
}

function epley(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

function brzycki(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  if (reps >= 37) return 0;
  return weightKg * (36 / (37 - reps));
}

function lander(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return (weightKg * 100) / (101.3 - 2.67123 * reps);
}

function computeAll(weightKg: number, reps: number): OneRMResult {
  const e = roundTo1(epley(weightKg, reps));
  const b = roundTo1(brzycki(weightKg, reps));
  const l = roundTo1(lander(weightKg, reps));
  const consensus = roundTo1((e + b + l) / 3);

  return {
    epley: e,
    brzycki: b,
    lander: l,
    consensus,
    method: reps === 1 ? 'tested' : 'calculated',
  };
}

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

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { weightKg, reps } = body;

  if (typeof weightKg !== 'number' || typeof reps !== 'number') {
    return jsonResponse({ error: 'weightKg and reps must be numbers' }, 400);
  }

  if (weightKg <= 0) {
    return jsonResponse({ error: 'weightKg must be greater than 0' }, 422);
  }

  if (reps <= 0 || reps > 36) {
    return jsonResponse({ error: 'reps must be between 1 and 36' }, 422);
  }

  const result = computeAll(weightKg, reps);
  return jsonResponse(result);
});
