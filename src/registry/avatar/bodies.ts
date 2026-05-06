export type AvatarBodyId =
  | 'phantom'
  | 'sentinel'
  | 'wraith'
  | 'titan'
  | 'specter'
  | 'ronin';

export type AvatarBody = {
  id: AvatarBodyId;
  codename: string;
  tagline: string;
  /** Relative silhouette proportions — consumed by the avatar renderer */
  proportions: {
    heightRatio: number;   // 0.8 (compact) – 1.2 (tall), 1.0 = baseline
    widthRatio: number;    // 0.8 (narrow) – 1.3 (broad)
    shapeVariant: 'angular' | 'fluid' | 'massive' | 'spectral';
  };
  starterGearIds: string[];
};

export const AVATAR_BODIES: Record<AvatarBodyId, AvatarBody> = {
  phantom: {
    id: 'phantom',
    codename: 'PHANTOM',
    tagline: 'Moves through walls. Leaves no shadow.',
    proportions: { heightRatio: 1.15, widthRatio: 0.82, shapeVariant: 'angular' },
    starterGearIds: ['s-h-02', 's-t-02', 's-l-02', 's-a-03'],
  },
  sentinel: {
    id: 'sentinel',
    codename: 'SENTINEL',
    tagline: 'The line holds here.',
    proportions: { heightRatio: 1.0, widthRatio: 1.05, shapeVariant: 'angular' },
    starterGearIds: ['s-h-01', 's-t-03', 's-l-01', 's-a-01'],
  },
  wraith: {
    id: 'wraith',
    codename: 'WRAITH',
    tagline: 'Cloaked. Present. Watching.',
    proportions: { heightRatio: 1.08, widthRatio: 0.9, shapeVariant: 'fluid' },
    starterGearIds: ['s-h-02', 's-t-02', 's-l-02', 's-a-03'],
  },
  titan: {
    id: 'titan',
    codename: 'TITAN',
    tagline: 'Immovable. Inevitable.',
    proportions: { heightRatio: 0.96, widthRatio: 1.28, shapeVariant: 'massive' },
    starterGearIds: ['s-h-01', 's-t-01', 's-l-03', 's-a-01'],
  },
  specter: {
    id: 'specter',
    codename: 'SPECTER',
    tagline: 'Between frequencies. Barely here.',
    proportions: { heightRatio: 1.12, widthRatio: 0.78, shapeVariant: 'spectral' },
    starterGearIds: ['s-h-03', 's-t-02', 's-l-02', 's-a-02'],
  },
  ronin: {
    id: 'ronin',
    codename: 'RONIN',
    tagline: 'No master. No house. Just the mission.',
    proportions: { heightRatio: 1.0, widthRatio: 0.95, shapeVariant: 'angular' },
    starterGearIds: ['s-h-01', 's-t-01', 's-l-01', 's-a-02'],
  },
} as const;

export const AVATAR_BODY_LIST: AvatarBody[] = Object.values(AVATAR_BODIES);
