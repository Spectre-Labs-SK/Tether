import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { AvatarLoadout, ProfileAvatarState } from '../lib/supabase';
import type { AvatarBodyId } from '../registry/avatar/bodies';
import type { GearSlot } from '../registry/avatar/gear';
import { AVATAR_BODIES } from '../registry/avatar/bodies';
import { GEAR_BY_ID } from '../registry/avatar/gear';

export type AvatarLoadoutReturn = {
  bodyId: AvatarBodyId | null;
  loadout: AvatarLoadout;
  unlockedGearIds: string[];
  isLoading: boolean;
  error: string | null;
  selectBody: (bodyId: AvatarBodyId) => Promise<void>;
  equipGear: (slot: GearSlot, gearId: string) => Promise<void>;
  unequipGear: (slot: GearSlot) => Promise<void>;
  unlockGear: (gearId: string) => Promise<void>;
};

const SLOT_KEY: Record<GearSlot, keyof AvatarLoadout> = {
  HELM: 'helm',
  TORSO: 'torso',
  LEGS: 'legs',
  ACCESSORY: 'accessory',
};

export function useAvatarLoadout(userId: string | null): AvatarLoadoutReturn {
  const [state, setState] = useState<ProfileAvatarState>({
    avatar_body_id: null,
    avatar_loadout: null,
    unlocked_gear_ids: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    supabase
      .from('profiles')
      .select('avatar_body_id, avatar_loadout, unlocked_gear_ids')
      .eq('id', userId)
      .single()
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else if (data) {
          setState({
            avatar_body_id: data.avatar_body_id ?? null,
            avatar_loadout: (data.avatar_loadout as AvatarLoadout) ?? null,
            unlocked_gear_ids: data.unlocked_gear_ids ?? [],
          });
        }
        setIsLoading(false);
      });
  }, [userId]);

  const persist = useCallback(
    async (patch: Partial<ProfileAvatarState>) => {
      if (!userId) return;
      const { error: err } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId);
      if (err) setError(err.message);
    },
    [userId],
  );

  const selectBody = useCallback(
    async (bodyId: AvatarBodyId) => {
      const body = AVATAR_BODIES[bodyId];
      // Seed the starter loadout from the body definition
      const starterLoadout: AvatarLoadout = {};
      for (const gearId of body.starterGearIds) {
        const item = GEAR_BY_ID[gearId];
        if (item) starterLoadout[SLOT_KEY[item.slot]] = gearId;
      }

      const next: Partial<ProfileAvatarState> = {
        avatar_body_id: bodyId,
        avatar_loadout: starterLoadout,
        unlocked_gear_ids: [...new Set([...state.unlocked_gear_ids, ...body.starterGearIds])],
      };

      setState(prev => ({ ...prev, ...next }));
      await persist(next);
    },
    [state.unlocked_gear_ids, persist],
  );

  const equipGear = useCallback(
    async (slot: GearSlot, gearId: string) => {
      const item = GEAR_BY_ID[gearId];
      if (!item || item.slot !== slot) return;
      if (!state.unlocked_gear_ids.includes(gearId)) return;

      const nextLoadout: AvatarLoadout = { ...state.avatar_loadout, [SLOT_KEY[slot]]: gearId };
      setState(prev => ({ ...prev, avatar_loadout: nextLoadout }));
      await persist({ avatar_loadout: nextLoadout });
    },
    [state.avatar_loadout, state.unlocked_gear_ids, persist],
  );

  const unequipGear = useCallback(
    async (slot: GearSlot) => {
      const nextLoadout: AvatarLoadout = { ...state.avatar_loadout };
      delete nextLoadout[SLOT_KEY[slot]];
      setState(prev => ({ ...prev, avatar_loadout: nextLoadout }));
      await persist({ avatar_loadout: nextLoadout });
    },
    [state.avatar_loadout, persist],
  );

  const unlockGear = useCallback(
    async (gearId: string) => {
      if (!GEAR_BY_ID[gearId]) return;
      if (state.unlocked_gear_ids.includes(gearId)) return;

      const next = [...state.unlocked_gear_ids, gearId];
      setState(prev => ({ ...prev, unlocked_gear_ids: next }));
      await persist({ unlocked_gear_ids: next });
    },
    [state.unlocked_gear_ids, persist],
  );

  return {
    bodyId: (state.avatar_body_id as AvatarBodyId | null),
    loadout: state.avatar_loadout ?? {},
    unlockedGearIds: state.unlocked_gear_ids,
    isLoading,
    error,
    selectBody,
    equipGear,
    unequipGear,
    unlockGear,
  };
}
