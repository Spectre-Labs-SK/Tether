import { createClient } from '@supabase/supabase-js';

// Falls back to placeholder values when .env.local is absent so createClient
// doesn't throw at module init. Auth calls will fail gracefully (EntryGate
// handles this via its error path → setAuthReady(true) without userId).
// process.env.EXPO_PUBLIC_* works natively in Expo/Metro.
// Vite injects these same names via the `define` block in vite.config.ts,
// so this single pattern works in both bundlers.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Upgrades an anonymous session to a permanent identity.
// Uses updateUser (not signOut+signIn) so the existing UUID is preserved —
// all profile data, joint ops, and history stay intact.
export async function upgradeAnonymousUser(email: string, password: string) {
  return supabase.auth.updateUser({ email, password });
}

// Signs in a returning operative on a new device.
export async function signInWithEmailPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export type Profile = {
  id: string;
  random_handle: string;
  is_crisis_mode: boolean;
  onboarding_pending: boolean;
  is_registered: boolean;
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

// Avatar system — migration 07
export type AvatarLoadout = {
  helm?: string;
  torso?: string;
  legs?: string;
  accessory?: string;
};

export type ProfileAvatarState = {
  avatar_body_id: string | null;
  avatar_loadout: AvatarLoadout | null;
  unlocked_gear_ids: string[];
};

export type BehaviorEventFamily =
  | 'task_action'
  | 'user_correction'
  | 'chaos_response'
  | 'question_answer'
  | 'plan_action'
  | 'trust_action';

export type BehaviorEventType =
  | 'complete'
  | 'skip'
  | 'substitute'
  | 'shuffle'
  | 'defer'
  | 'correction'
  | 'chaos_response'
  | 'partner_response'
  | 'asked'
  | 'answered'
  | 'question_skipped'
  | 'accepted'
  | 'changed'
  | 'rejected'
  | 'wipe_requested'
  | 'wipe_completed'
  | 'kill_switch_checked';

export type BehaviorEvent = {
  id: string;
  profile_id: string;
  event_family: BehaviorEventFamily;
  event_type: BehaviorEventType;
  source: string;
  context: Record<string, unknown>;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
};

export type QuestionSession = {
  id: string;
  profile_id: string;
  plan_id: string | null;
  purpose: string;
  questions: Array<{ id: string; prompt: string }>;
  answers: Array<{ question_id: string; answer: string }>;
  question_count: number;
  status: 'drafting' | 'answered' | 'skipped' | 'abandoned';
  created_at: string;
  updated_at: string;
};

export type GeneratedPlan = {
  id: string;
  profile_id: string;
  joint_op_id: string | null;
  source: 'local_draft' | 'ai_draft' | 'user_seeded';
  title: string;
  mode: 'joint_ops' | 'ghost_ops' | 'solo';
  status: 'draft' | 'active' | 'complete' | 'deferred' | 'abandoned';
  draft_context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PlanStep = {
  id: string;
  plan_id: string;
  step_order: number;
  domain: string;
  title: string;
  instructions: string;
  status: 'pending' | 'complete' | 'skipped' | 'substituted' | 'deferred';
  alternate: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PlanActionType =
  | 'complete'
  | 'skip'
  | 'substitute'
  | 'shuffle'
  | 'defer'
  | 'correction'
  | 'partner_response';

export type PlanAction = {
  id: string;
  plan_id: string;
  step_id: string | null;
  profile_id: string;
  action_type: PlanActionType;
  note: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ScreenshotIngestion = {
  id: string;
  profile_id: string;
  storage_path: string;
  source: 'manual_upload' | 'receipt' | 'finance_screenshot';
  status: 'stored' | 'queued' | 'parsed' | 'confirmed' | 'rejected';
  metadata: Record<string, unknown>;
  uploaded_at: string;
};

export type Account = {
  id: string;
  profile_id: string;
  screenshot_id: string | null;
  label: string;
  account_kind: string;
  last_four: string | null;
  inferred_balance_cents: number | null;
  user_confirmed: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  profile_id: string;
  account_id: string | null;
  screenshot_id: string | null;
  label: string;
  amount_cents: number;
  occurred_on: string | null;
  user_confirmed: boolean;
  created_at: string;
};

export type Envelope = {
  id: string;
  profile_id: string;
  label: string;
  target_cents: number;
  current_cents: number;
  user_approved: boolean;
  created_at: string;
  updated_at: string;
};

export type PantryItem = {
  id: string;
  profile_id: string;
  label: string;
  quantity: string | null;
  source: string;
  last_seen_at: string;
  created_at: string;
};

export type PendulumEvent = {
  id: string;
  profile_id: string;
  signal_window: string;
  status: 'observed' | 'offered' | 'dismissed' | 'accepted';
  copy: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type NoseyQuestionLog = {
  id: string;
  profile_id: string;
  question: string;
  answer: string | null;
  status: 'asked' | 'answered' | 'skipped' | 'dismissed';
  asked_at: string;
};
