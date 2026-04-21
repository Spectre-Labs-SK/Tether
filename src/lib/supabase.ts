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
