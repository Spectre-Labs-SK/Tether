export type ValkyriePart = {
  id: string;
  name: string;
  rarity: 'COMMON' | 'ELITE' | 'PRIME';
  isQueenOnly: boolean;
};

export const VALKYRIE_MANIFEST = {
  id: 'v-prime-01',
  codename: 'VALKYRIE',
  title: 'The Queen',
  gear: {
    helmets: [
      { id: 'v-h-01', name: 'Shimmer Crown', rarity: 'PRIME', isQueenOnly: true },
      { id: 'v-h-02', name: 'Shadow Visor', rarity: 'ELITE', isQueenOnly: false }
    ],
    wings: [
      { id: 'v-w-01', name: 'Ethereal Flight-Span', rarity: 'PRIME', isQueenOnly: true },
      { id: 'v-w-02', name: 'Carbon Thruster', rarity: 'COMMON', isQueenOnly: false }
    ]
  }
};