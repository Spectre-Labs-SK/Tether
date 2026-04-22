// requires: npm install @supabase/supabase-js
// requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  random_handle: string;
  is_crisis_mode: boolean;
  onboarding_pending: boolean;
  created_at: string;
  updated_at: string;
};

export type LifeSectors = {
  id: string;
  profile_id: string;
  finance: number;
  health: number;
  work: number;
  groceries: number;
  updated_at: string;
};

// Joint Ops — collaborative mission layer (migration 03)
export type JointOp = {
  id: string;
  owner_id: string;
  codename: string;
  shimmer_mode: 'MILITARY' | 'ETHER';
  status: 'active' | 'standby' | 'complete' | 'aborted';
  // clash_state added migration 04: none = nominal, contested = conflict flagged, locked = op blocked
  clash_state: 'none' | 'contested' | 'locked';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OpMember = {
  id: string;
  op_id: string;
  profile_id: string;
  role: 'commander' | 'operative' | 'observer';
  joined_at: string;
};

export type OpCheckpoint = {
  id: string;
  op_id: string;
  assigned_to: string | null;
  title: string;
  status: 'pending' | 'in_progress' | 'complete' | 'blocked';
  priority: 1 | 2 | 3 | 4;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

// HR Readings — per-profile heart rate log (migration 04)
export type HRReading = {
  id: string;
  profile_id: string;
  bpm: number;
  context: 'cardio' | 'rest' | 'lifting' | 'recovery';
  recorded_at: string;
};

// OpHRSync — shared operative HR snapshots within a joint op (migration 04)
export type OpHRSync = {
  id: string;
  op_id: string;
  profile_id: string;
  bpm: number;
  recorded_at: string;
};
