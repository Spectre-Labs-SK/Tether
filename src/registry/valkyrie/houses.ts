export type RoninHouseId = 'the-outpost' | 'sector-7' | 'iron-gate';

export type RoninTier = 'COMMAND' | 'FIELD' | 'SHADOW';

export type ShimmerMode = 'MILITARY' | 'ETHER';

export interface RoninHouseColors {
  primary: string;
  accent: string;
}

export interface RoninHouse {
  id: RoninHouseId;
  name: string;
  tagline: string;
  tier: RoninTier;
  shimmerMode: ShimmerMode;
  colors: RoninHouseColors;
  isActive: boolean;
}

export const RONIN_HOUSES: Record<RoninHouseId, RoninHouse> = {
  'the-outpost': {
    id: 'the-outpost',
    name: 'The Outpost',
    tagline: 'First in. Last out.',
    tier: 'FIELD',
    shimmerMode: 'MILITARY',
    colors: {
      primary: '#1e293b',
      accent: '#64748b',
    },
    isActive: true,
  },
  'sector-7': {
    id: 'sector-7',
    name: 'Sector 7',
    tagline: 'Where orders dissolve and instinct commands.',
    tier: 'SHADOW',
    shimmerMode: 'ETHER',
    colors: {
      primary: '#6d28d9',
      accent: '#a78bfa',
    },
    isActive: true,
  },
  'iron-gate': {
    id: 'iron-gate',
    name: 'Iron Gate',
    tagline: 'Nothing passes without a price.',
    tier: 'COMMAND',
    shimmerMode: 'MILITARY',
    colors: {
      primary: '#0f172a',
      accent: '#475569',
    },
    isActive: true,
  },
};

export const RONIN_HOUSE_LIST: RoninHouse[] = Object.values(RONIN_HOUSES);
