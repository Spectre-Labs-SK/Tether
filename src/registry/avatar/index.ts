export type { AvatarBodyId, AvatarBody } from './bodies';
export type { ThemeId, Theme } from './themes';
export type { GearSlot, GearRarity, GearItem } from './gear';

export { AVATAR_BODIES, AVATAR_BODY_LIST } from './bodies';
export { THEMES } from './themes';
export { ALL_GEAR, GEAR_BY_ID, GEAR_BY_SLOT, STARTER_GEAR_IDS } from './gear';

import { AVATAR_BODIES, AVATAR_BODY_LIST } from './bodies';
import { THEMES } from './themes';
import { ALL_GEAR, GEAR_BY_ID, GEAR_BY_SLOT, STARTER_GEAR_IDS } from './gear';

export const AVATAR_MANIFEST = {
  bodies: AVATAR_BODY_LIST,
  bodiesById: AVATAR_BODIES,
  themes: THEMES,
  gear: {
    all: ALL_GEAR,
    byId: GEAR_BY_ID,
    bySlot: GEAR_BY_SLOT,
    starterIds: STARTER_GEAR_IDS,
  },
} as const;
