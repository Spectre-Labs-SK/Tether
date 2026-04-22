export type ValkyriePart = {
  id: string;
  name: string;
  rarity: 'COMMON' | 'ELITE' | 'PRIME';
  isQueenOnly: boolean;
};

export type MovementType = 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'accessory';

export type EquipmentType = 'barbell' | 'dumbbell' | 'machine' | 'dips-station' | 'bodyweight';

export type ValkyrieExercise = {
  id: string;
  name: string;
  targetSets: number;
  minReps: number;
  maxReps: number;
  muscleGroup: string;
  movementType: MovementType;
  equipmentType: EquipmentType;
};

export const VALKYRIE_MANIFEST = {
  id: 'v-prime-01',
  codename: 'VALKYRIE',
  title: 'The Queen',
  gear: {
    helmets: [
      { id: 'v-h-01', name: 'Shimmer Crown', rarity: 'PRIME', isQueenOnly: true },
      { id: 'v-h-02', name: 'Shadow Visor', rarity: 'ELITE', isQueenOnly: false },
    ],
    wings: [
      { id: 'v-w-01', name: 'Ethereal Flight-Span', rarity: 'PRIME', isQueenOnly: true },
      { id: 'v-w-02', name: 'Carbon Thruster', rarity: 'COMMON', isQueenOnly: false },
    ],
  },
  training: {
    pushDay: {
      label: 'PUSH DAY',
      shimmerMode: 'MILITARY' as const,
      exercises: [
        {
          id: 'ex-bench-01',
          name: 'Barbell Bench Press',
          targetSets: 3,
          minReps: 8,
          maxReps: 10,
          muscleGroup: 'chest',
          movementType: 'push' as MovementType,
          equipmentType: 'barbell' as EquipmentType,
        },
        {
          id: 'ex-ohp-01',
          name: 'Overhead Press',
          targetSets: 3,
          minReps: 10,
          maxReps: 10,
          muscleGroup: 'shoulders',
          movementType: 'push' as MovementType,
          equipmentType: 'barbell' as EquipmentType,
        },
        {
          id: 'ex-dips-01',
          name: 'Dips',
          targetSets: 3,
          minReps: 12,
          maxReps: 12,
          muscleGroup: 'triceps',
          movementType: 'push' as MovementType,
          equipmentType: 'dips-station' as EquipmentType,
        },
      ] satisfies ValkyrieExercise[],
    },
  },
} as const;