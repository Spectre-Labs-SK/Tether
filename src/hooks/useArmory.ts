import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { agentLog } from '../lib/agentLog';
import type { BitchWeightFlag, TrickyCardioGate } from './useTetherState';

export type ArmoryReturn = {
  // Flags exercises where 1RM delta < 2% over 6 weeks → force AMRAP
  bitchweights: () => Promise<BitchWeightFlag[]>;
  // Gates lifting until >= 5 min at >= 120 bpm within the last 45 min
  trickycardio: () => Promise<TrickyCardioGate>;
};

const CARDIO_THRESHOLD_BPM    = 120;
const REQUIRED_CARDIO_MINUTES = 5;
const CARDIO_WINDOW_MINUTES   = 45;

export function useArmory(userId: string | null): ArmoryReturn {
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

  return { bitchweights, trickycardio };
}
