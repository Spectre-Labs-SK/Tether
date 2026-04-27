import { create } from 'zustand';

export type ShimmerTarget = {
  distort: number;           // 0.0 – 1.0
  color: string;             // hex
  speed: number;             // MeshDistortMaterial animation speed
  metalness: number;         // 0.0 – 1.0
  emissiveIntensity: number;
  floatIntensity: number;    // React prop on <Float> — NOT lerped in useFrame
  floatSpeed: number;        // React prop on <Float> — NOT lerped in useFrame
};

type PatternStore = {
  target: ShimmerTarget;
  setTarget: (next: Partial<ShimmerTarget>) => void;
};

export const DEFAULTS: ShimmerTarget = {
  distort: 0.15,
  color: '#1e293b',
  speed: 1,
  metalness: 0.9,
  emissiveIntensity: 0,
  floatIntensity: 0.5,
  floatSpeed: 1,
};

export const usePatternStore = create<PatternStore>((set) => ({
  target: { ...DEFAULTS },
  setTarget: (next) =>
    set((state) => ({ target: { ...state.target, ...next } })),
}));
