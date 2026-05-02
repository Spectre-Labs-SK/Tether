import { useState, useEffect, useCallback } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import { agentLog } from '../lib/agentLog';

// Retained for consumers pending migration to domain-specific hooks
export type UIConfig = 'full' | 'minimalist';

export type ValkyrieTheme = 'MILITARY' | 'ETHER';

// Retained for future home in a dedicated analytics hook
export type BitchWeightFlag = {
  exercise_id: string;
  current_1rm_kg: number;
  six_weeks_ago_1rm_kg: number;
  delta_pct: number;
  force_amrap: true;
};

// Retained for future home in a dedicated analytics hook
export type TrickyCardioGate = {
  liftingGated: boolean;
  minutesAtThreshold: number;
  requiredMinutes: number;
  thresholdBpm: number;
};

// Explicit state shape mirroring the profiles table schema.
// Fields is_nightmare_active, theme_state, and last_sync_timestamp are
// pending migration 06 — toTetherState() supplies safe defaults until then.
export type TetherState = {
  id: string;
  random_handle: string;
  is_crisis_mode: boolean;
  onboarding_pending: boolean;
  is_registered: boolean;
  is_nightmare_active: boolean;
  theme_state: ValkyrieTheme;
  last_sync_timestamp: string;
  created_at: string;
  updated_at: string;
};

export type TetherStateReturn = {
  state: TetherState | null;
  isLoading: boolean;
  error: Error | null;
  sync: () => Promise<void>;
  updateTheme: (theme: ValkyrieTheme) => Promise<void>;
  // Feu Follet Ethics Charter — user-accessible session kill switch
  triggerKillSwitch: () => void;
};

const ADJECTIVES = ['ghost', 'shadow', 'void', 'echo', 'neon', 'cipher', 'static', 'drift', 'nova', 'phantom'];
const NOUNS      = ['hawk', 'circuit', 'signal', 'protocol', 'node', 'matrix', 'vector', 'pulse', 'relay', 'core'];

function generateRandomHandle(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num  = Math.floor(Math.random() * 999) + 1;
  return `${adj}-${noun}-${num}`;
}

// Supabase rows may contain pre-migration columns not yet reflected in Profile type.
type RawRow = Profile & { is_nightmare_active?: boolean; theme_state?: string };

function toTetherState(raw: RawRow): TetherState {
  return {
    id: raw.id,
    random_handle: raw.random_handle,
    is_crisis_mode: raw.is_crisis_mode,
    onboarding_pending: raw.onboarding_pending,
    is_registered: raw.is_registered,
    is_nightmare_active: raw.is_nightmare_active ?? false,
    theme_state: (raw.theme_state as ValkyrieTheme | undefined) ?? 'MILITARY',
    last_sync_timestamp: new Date().toISOString(),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export function useTetherState(userId: string | null): TetherStateReturn {
  const [state, setState]       = useState<TetherState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState<Error | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    agentLog.architect(`Loading profile for userId: ${userId}`);

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !data) {
      const handle = generateRandomHandle();
      agentLog.architect(`No profile found. Bootstrapping with handle: ${handle}`);

      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert({ id: userId, random_handle: handle })
        .select()
        .single();

      if (createError || !created) {
        setError(new Error(createError?.message ?? 'Profile bootstrap failed'));
        agentLog.architect(`ERROR creating profile: ${createError?.message}`);
      } else {
        setState(toTetherState(created));
        agentLog.valkyrie(`Profile created: ${handle}. The Queen sees you. You're not alone.`);
      }
    } else {
      // State machine: crisis_mode on but onboarding_pending unset — correct it
      if (data.is_crisis_mode && !data.onboarding_pending) {
        agentLog.architect(`Crisis mode detected. Enforcing onboarding_pending = TRUE.`);

        const { data: patched, error: patchError } = await supabase
          .from('profiles')
          .update({ onboarding_pending: true })
          .eq('id', userId)
          .select()
          .single();

        setState(toTetherState(patched ?? data));

        if (patchError) {
          agentLog.architect(`WARNING: crisis_mode fix write failed: ${patchError.message}`);
        }
      } else {
        setState(toTetherState(data));
      }

      agentLog.architect(
        `Profile loaded: ${data.random_handle} | crisis=${data.is_crisis_mode} | onboarding=${data.onboarding_pending}`
      );
    }

    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const sync = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const updateTheme = useCallback(async (theme: ValkyrieTheme) => {
    if (!userId) return;
    agentLog.architect(`Updating theme to ${theme} for ${userId}`);

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ theme_state: theme })
      .eq('id', userId)
      .select()
      .single();

    if (!updateError && data) {
      setState(toTetherState(data));
      agentLog.valkyrie(`Theme locked to ${theme}. The Queen's aesthetic is yours.`);
    } else {
      setError(new Error(updateError?.message ?? 'Theme update failed'));
      agentLog.architect(`ERROR updating theme: ${updateError?.message}`);
    }
  }, [userId]);

  const triggerKillSwitch = useCallback(() => {
    agentLog.architect(`Kill switch activated. Clearing local session.`);
    setState(null);
    setError(null);
    supabase.auth.signOut().catch((err: Error) => {
      agentLog.architect(`Kill switch signOut error: ${err.message}`);
    });
  }, []);

  return { state, isLoading, error, sync, updateTheme, triggerKillSwitch };
}
