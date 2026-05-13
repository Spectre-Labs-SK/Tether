import { useCallback, useMemo, useState } from 'react';
import {
  supabase,
  type BehaviorEventFamily,
  type BehaviorEventType,
} from '../lib/supabase';
import { agentLog } from '../lib/agentLog';

export type Level0BunkerMode = 'MILITARY' | 'ETHER' | 'MIXED';

export type Level0BunkerAction =
  | 'complete'
  | 'skip'
  | 'substitute'
  | 'shuffle'
  | 'defer'
  | 'correction'
  | 'partner_response'
  | 'chaos_response';

export type RepairedSection = 'training_corner' | 'comms_panel' | 'blast_door';

export type ChaosEvent = {
  id: string;
  title: string;
  detail: string;
  intensity: 'low' | 'medium' | 'high';
};

export type IntelDrop = {
  earned: boolean;
  opened: boolean;
  label: string;
};

export type Level0BunkerState = {
  mode: Level0BunkerMode;
  degradationLevel: number;
  repairedSections: RepairedSection[];
  lockedDoorProgress: number;
  intelDrop: IntelDrop;
  activeChaosEvent: ChaosEvent;
  pendingBehaviorEvents: number;
};

export type Level0BunkerReturn = {
  state: Level0BunkerState;
  setMode: (mode: Level0BunkerMode) => void;
  completeAction: () => Promise<void>;
  skipAction: () => Promise<void>;
  substituteAction: () => Promise<void>;
  shuffleAction: () => Promise<void>;
  deferAction: () => Promise<void>;
  recordCorrection: (note: string) => Promise<void>;
  respondToChaos: (response: 'defended' | 'ignored' | 'deferred' | 'recovered') => Promise<void>;
  openIntelDrop: () => void;
};

const INITIAL_CHAOS: ChaosEvent = {
  id: 'laundry-breach',
  title: 'Laundry breach at the west hatch',
  detail: 'The base took a soft hit. One honest action stabilizes the room.',
  intensity: 'medium',
};

const INITIAL_STATE: Level0BunkerState = {
  mode: 'MIXED',
  degradationLevel: 64,
  repairedSections: [],
  lockedDoorProgress: 15,
  intelDrop: {
    earned: false,
    opened: false,
    label: '// INTEL RECOVERED',
  },
  activeChaosEvent: INITIAL_CHAOS,
  pendingBehaviorEvents: 0,
};

function eventFamilyFor(action: Level0BunkerAction): BehaviorEventFamily {
  if (action === 'correction') return 'user_correction';
  if (action === 'chaos_response') return 'chaos_response';
  if (action === 'partner_response') return 'plan_action';
  return 'task_action';
}

function eventTypeFor(action: Level0BunkerAction): BehaviorEventType {
  return action === 'chaos_response' ? 'chaos_response' : action;
}

function addUniqueSection(sections: RepairedSection[], section: RepairedSection): RepairedSection[] {
  return sections.includes(section) ? sections : [...sections, section];
}

export function useLevel0Bunker(userId: string | null): Level0BunkerReturn {
  const [state, setState] = useState<Level0BunkerState>(INITIAL_STATE);

  const logBehavior = useCallback(async (
    action: Level0BunkerAction,
    metadata: Record<string, unknown> = {},
  ): Promise<void> => {
    if (!userId) {
      setState(prev => ({ ...prev, pendingBehaviorEvents: prev.pendingBehaviorEvents + 1 }));
      agentLog.architect(`Queued Level 0 behavior without userId: ${action}`);
      return;
    }

    const { error } = await supabase.from('behavior_events').insert({
      profile_id: userId,
      event_family: eventFamilyFor(action),
      event_type: eventTypeFor(action),
      source: 'level_0_bunker',
      context: { mode: state.mode, chaos_event_id: state.activeChaosEvent.id },
      metadata,
    });

    if (error) {
      agentLog.architect(`ERROR logging Level 0 behavior: ${error.message}`);
      setState(prev => ({ ...prev, pendingBehaviorEvents: prev.pendingBehaviorEvents + 1 }));
    }
  }, [state.activeChaosEvent.id, state.mode, userId]);

  const completeAction = useCallback(async (): Promise<void> => {
    await logBehavior('complete', { repaired_section: 'training_corner' });
    setState(prev => ({
      ...prev,
      degradationLevel: Math.max(0, prev.degradationLevel - 18),
      repairedSections: addUniqueSection(prev.repairedSections, 'training_corner'),
      lockedDoorProgress: Math.min(100, prev.lockedDoorProgress + 35),
      intelDrop: { ...prev.intelDrop, earned: true },
    }));
  }, [logBehavior]);

  const skipAction = useCallback(async (): Promise<void> => {
    await logBehavior('skip', { reason: 'user_chose_not_now' });
    setState(prev => ({
      ...prev,
      degradationLevel: Math.min(100, prev.degradationLevel + 4),
    }));
  }, [logBehavior]);

  const substituteAction = useCallback(async (): Promise<void> => {
    await logBehavior('substitute', { replacement: 'smaller_action' });
    setState(prev => ({
      ...prev,
      degradationLevel: Math.max(0, prev.degradationLevel - 9),
      repairedSections: addUniqueSection(prev.repairedSections, 'comms_panel'),
      lockedDoorProgress: Math.min(100, prev.lockedDoorProgress + 18),
    }));
  }, [logBehavior]);

  const shuffleAction = useCallback(async (): Promise<void> => {
    await logBehavior('shuffle', { next_offer: 'change_order' });
    setState(prev => ({
      ...prev,
      activeChaosEvent: {
        id: 'snack-cabinet-alarm',
        title: 'Snack cabinet alarm',
        detail: 'A tiny re-order keeps momentum alive without pretending life is tidy.',
        intensity: 'low',
      },
    }));
  }, [logBehavior]);

  const deferAction = useCallback(async (): Promise<void> => {
    await logBehavior('defer', { timing_signal: 'later_today' });
    setState(prev => ({
      ...prev,
      degradationLevel: Math.min(100, prev.degradationLevel + 2),
    }));
  }, [logBehavior]);

  const recordCorrection = useCallback(async (note: string): Promise<void> => {
    await logBehavior('correction', { note });
  }, [logBehavior]);

  const respondToChaos = useCallback(async (
    response: 'defended' | 'ignored' | 'deferred' | 'recovered',
  ): Promise<void> => {
    await logBehavior('chaos_response', { response });
    setState(prev => ({
      ...prev,
      degradationLevel: response === 'defended' || response === 'recovered'
        ? Math.max(0, prev.degradationLevel - 10)
        : Math.min(100, prev.degradationLevel + 6),
    }));
  }, [logBehavior]);

  const openIntelDrop = useCallback((): void => {
    setState(prev => ({
      ...prev,
      intelDrop: prev.intelDrop.earned
        ? { ...prev.intelDrop, opened: true }
        : prev.intelDrop,
    }));
  }, []);

  return useMemo(() => ({
    state,
    setMode: (mode: Level0BunkerMode) => setState(prev => ({ ...prev, mode })),
    completeAction,
    skipAction,
    substituteAction,
    shuffleAction,
    deferAction,
    recordCorrection,
    respondToChaos,
    openIntelDrop,
  }), [
    completeAction,
    deferAction,
    openIntelDrop,
    recordCorrection,
    respondToChaos,
    shuffleAction,
    skipAction,
    state,
    substituteAction,
  ]);
}
