import { useState, useEffect, useCallback } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import { agentLog } from '../lib/agentLog';

export type UIConfig = 'full' | 'minimalist';

// Returned by bitchweights() for each stalled exercise
export type BitchWeightFlag = {
  exercise_id: string;
  current_1rm_kg: number;
  six_weeks_ago_1rm_kg: number;
  delta_pct: number;
  force_amrap: true;
};

// Returned by trickycardio() — gates lifting access behind a pre-lift HR check
export type TrickyCardioGate = {
  liftingGated: boolean;
  minutesAtThreshold: number;
  requiredMinutes: number;
  thresholdBpm: number;
};

export type TetherStateReturn = {
  profile: Profile | null;
  uiConfig: UIConfig;
  isLoading: boolean;
  // isUntracked: TRUE when userId is null post-resolution — user has bypassed Handle Registration.
  // Treat as a Bitch-Weight guard: the caller must decide whether to allow untracked access or surface a warning.
  isUntracked: boolean;
  triggerCrisisMode: () => Promise<void>;
  exitCrisisMode: () => Promise<void>;
  // bitchweights: flags any exercise where 1RM delta < 2% over 6 weeks → force AMRAP
  bitchweights: () => Promise<BitchWeightFlag[]>;
  // trickycardio: gates lifting until >= 5 min at >= 120 bpm within the last 45 min
  trickycardio: () => Promise<TrickyCardioGate>;
};

const ADJECTIVES = ['ghost', 'shadow', 'void', 'echo', 'neon', 'cipher', 'static', 'drift', 'nova', 'phantom'];
const NOUNS      = ['hawk', 'circuit', 'signal', 'protocol', 'node', 'matrix', 'vector', 'pulse', 'relay', 'core'];

function generateRandomHandle(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num  = Math.floor(Math.random() * 999) + 1;
  return `${adj}-${noun}-${num}`;
}

const CARDIO_THRESHOLD_BPM    = 120;
const REQUIRED_CARDIO_MINUTES = 5;
const CARDIO_WINDOW_MINUTES   = 45;

export function useTetherState(userId: string | null): TetherStateReturn {
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State machine: crisis mode forces minimalist UI + onboarding flag
  const uiConfig: UIConfig = profile?.is_crisis_mode ? 'minimalist' : 'full';

  // Bitch-Weight guard: user has no registered handle post-resolution — HR tracking bypassed.
  const isUntracked = !isLoading && !userId;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      agentLog.architect(`Loading profile for userId: ${userId}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // No profile yet — bootstrap with random handle (minimal friction)
        const handle = generateRandomHandle();
        agentLog.architect(`No profile found. Bootstrapping with handle: ${handle}`);

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({ id: userId, random_handle: handle })
          .select()
          .single();

        if (!createError && created) {
          setProfile(created);
          agentLog.valkyrie(`Profile created: ${handle}. The Queen sees you. You're not alone.`);
        } else {
          agentLog.architect(`ERROR creating profile: ${createError?.message}`);
        }
      } else {
        // State machine: if crisis_mode is on but onboarding_pending isn't set, fix it
        if (data.is_crisis_mode && !data.onboarding_pending) {
          agentLog.architect(`Crisis mode detected. Enforcing onboarding_pending = TRUE.`);
          await supabase
            .from('profiles')
            .update({ onboarding_pending: true })
            .eq('id', userId);
          setProfile({ ...data, onboarding_pending: true });
        } else {
          setProfile(data);
        }
        agentLog.architect(
          `Profile loaded: ${data.random_handle} | crisis=${data.is_crisis_mode} | onboarding=${data.onboarding_pending}`
        );
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [userId]);

  const triggerCrisisMode = async () => {
    if (!userId) return;

    const handle = profile?.random_handle ?? generateRandomHandle();
    agentLog.architect(`SOS triggered. handle=${handle}`);

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, random_handle: handle, is_crisis_mode: true, onboarding_pending: true })
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      agentLog.valkyrie(`SOS received. Switching to minimalist mode. You are safe. Handle: ${data.random_handle}`);
    } else {
      agentLog.architect(`ERROR triggering crisis mode: ${error?.message}`);
    }
  };

  const exitCrisisMode = async () => {
    if (!userId || !profile) return;
    agentLog.architect(`Exiting crisis mode for ${profile.random_handle}`);

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_crisis_mode: false })
      .eq('id', userId)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      agentLog.valkyrie(`Crisis cleared. Full mode restored. The Queen welcomes you back.`);
    } else {
      agentLog.architect(`ERROR exiting crisis mode: ${error?.message}`);
    }
  };

  // Scans one_rm_history for exercises where progress < 2% over the past 6 weeks.
  // Those exercises are flagged force_amrap: true — prescribed sets become AMRAP.
  const bitchweights = useCallback(async (): Promise<BitchWeightFlag[]> => {
    if (!userId) return [];

    agentLog.architect('Running bitchweights() — scanning 1RM delta over 6 weeks.');

    const { data, error } = await supabase
      .from('one_rm_history')
      .select('exercise_id, one_rm_kg, recorded_at')
      .eq('profile_id', userId)
      .order('recorded_at', { ascending: true });

    if (error || !data?.length) {
      agentLog.architect(`bitchweights(): no data or error: ${error?.message}`);
      return [];
    }

    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);
    const cutoff = sixWeeksAgo.toISOString();

    // Group into recent (within 6 weeks) vs baseline (older)
    const grouped: Record<string, { recent: number[]; baseline: number[] }> = {};
    for (const row of data) {
      if (!grouped[row.exercise_id]) grouped[row.exercise_id] = { recent: [], baseline: [] };
      if (row.recorded_at >= cutoff) {
        grouped[row.exercise_id].recent.push(row.one_rm_kg);
      } else {
        grouped[row.exercise_id].baseline.push(row.one_rm_kg);
      }
    }

    const flags: BitchWeightFlag[] = [];

    for (const [exercise_id, { recent, baseline }] of Object.entries(grouped)) {
      if (!recent.length || !baseline.length) continue;

      const current1rm  = Math.max(...recent);
      const baseline1rm = Math.max(...baseline);
      const deltaPct    = ((current1rm - baseline1rm) / baseline1rm) * 100;

      if (deltaPct < 2) {
        flags.push({ exercise_id, current_1rm_kg: current1rm, six_weeks_ago_1rm_kg: baseline1rm, delta_pct: deltaPct, force_amrap: true });
        agentLog.architect(`bitchweights() FLAGGED: ${exercise_id} delta=${deltaPct.toFixed(1)}% < 2%`);
        agentLog.valkyrie(`Stagnation detected on ${exercise_id}. AMRAP mode engaged. No more comfortable sets.`);
      }
    }

    agentLog.architect(`bitchweights() complete: ${flags.length} exercise(s) flagged.`);
    return flags;
  }, [userId]);

  // Checks hr_readings for >= REQUIRED_CARDIO_MINUTES readings at >= CARDIO_THRESHOLD_BPM
  // within the last CARDIO_WINDOW_MINUTES. Returns liftingGated: true if threshold not met.
  const trickycardio = useCallback(async (): Promise<TrickyCardioGate> => {
    const base: TrickyCardioGate = {
      liftingGated: false,
      minutesAtThreshold: 0,
      requiredMinutes: REQUIRED_CARDIO_MINUTES,
      thresholdBpm: CARDIO_THRESHOLD_BPM,
    };

    if (!userId) return base;

    agentLog.architect('Running trickycardio() — evaluating pre-lift HR clearance.');

    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - CARDIO_WINDOW_MINUTES);

    const { data, error } = await supabase
      .from('hr_readings')
      .select('bpm, recorded_at')
      .eq('profile_id', userId)
      .gte('recorded_at', windowStart.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) {
      agentLog.architect(`trickycardio() error: ${error.message}. Gate deactivated.`);
      return base;
    }

    if (!data?.length) {
      agentLog.valkyrie('No cardio data in the last 45 min. Get your heart rate up before you touch those weights.');
      return { ...base, liftingGated: true };
    }

    // Each reading represents ~1 minute of effort; count consecutive above-threshold windows
    const minutesAtThreshold = data.filter(r => r.bpm >= CARDIO_THRESHOLD_BPM).length;
    const cleared = minutesAtThreshold >= REQUIRED_CARDIO_MINUTES;

    if (cleared) {
      agentLog.architect(`trickycardio() CLEARED: ${minutesAtThreshold}min at >=${CARDIO_THRESHOLD_BPM}bpm.`);
      agentLog.valkyrie('Cardio gate cleared. Heart primed. The weights are yours.');
    } else {
      const remaining = REQUIRED_CARDIO_MINUTES - minutesAtThreshold;
      agentLog.architect(`trickycardio() BLOCKED: ${minutesAtThreshold}/${REQUIRED_CARDIO_MINUTES}min at >=${CARDIO_THRESHOLD_BPM}bpm.`);
      agentLog.valkyrie(`${remaining} more minute(s) of cardio required. Lifting is locked until you earn it.`);
    }

    return { liftingGated: !cleared, minutesAtThreshold, requiredMinutes: REQUIRED_CARDIO_MINUTES, thresholdBpm: CARDIO_THRESHOLD_BPM };
  }, [userId]);

  return { profile, uiConfig, isLoading, isUntracked, triggerCrisisMode, exitCrisisMode, bitchweights, trickycardio };
}
