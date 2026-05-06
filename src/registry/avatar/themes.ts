export type ThemeId = 'STARTER' | 'SCIFI' | 'FANTASY' | 'HISTORICAL' | 'CRYPTID';

export type Theme = {
  id: ThemeId;
  name: string;
  flavor: string;
  /** What the player earns or discovers to unlock this theme */
  unlockCondition: string;
  palette: {
    primary: string;
    accent: string;
    glow: string;
  };
};

export const THEMES: Record<ThemeId, Theme> = {
  STARTER: {
    id: 'STARTER',
    name: 'Operative',
    flavor: 'The baseline. Before the world went strange.',
    unlockCondition: 'available from the start',
    palette: { primary: '#1e293b', accent: '#64748b', glow: '#94a3b8' },
  },
  SCIFI: {
    id: 'SCIFI',
    name: 'Signal Lost',
    flavor: 'From the shimmer at the border to the machine that dreams. The line between organism and architecture dissolved somewhere back there.',
    unlockCondition: 'complete 30 consecutive tracked days',
    palette: { primary: '#0d1117', accent: '#00ffd0', glow: '#7df9ff' },
  },
  FANTASY: {
    id: 'FANTASY',
    name: 'The Old World',
    flavor: 'Dragonbone and court intrigue. Blood oaths and ancient debts. The forest remembers everything.',
    unlockCondition: 'complete a 7-day streak across all four domains',
    palette: { primary: '#1a0a00', accent: '#c9a84c', glow: '#e8c97a' },
  },
  HISTORICAL: {
    id: 'HISTORICAL',
    name: 'Iron & Doctrine',
    flavor: 'Legion formation. Shield wall. The tactical genius of armies that held civilization at the edge of collapse.',
    unlockCondition: 'complete 100 total sessions across any domains',
    palette: { primary: '#0d0d0d', accent: '#8b0000', glow: '#cc3300' },
  },
  CRYPTID: {
    id: 'CRYPTID',
    name: 'Unseen Record',
    flavor: 'Catalogued in the margins. Described by witnesses who were never believed. Still here.',
    unlockCondition: 'achieve a personal best in any domain three times',
    palette: { primary: '#0a1a0a', accent: '#4a7c59', glow: '#80c986' },
  },
} as const;
