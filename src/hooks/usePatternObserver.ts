import { useEffect } from 'react';
import { usePatternStore } from '../stores/patternStore';

export type Domain = 'Iron' | 'Road' | 'Mat' | 'Hub';

export type PatternSignals = {
  appMode: 'gate' | 'chill' | 'sos';
  shimmerMode: 'MILITARY' | 'ETHER';
  isCrisisMode: boolean;
  selectedDomain: Domain | null;
  liftingGated: boolean;
  bitchweightCount: number;
};

export function usePatternObserver(signals: PatternSignals): void {
  const setTarget = usePatternStore((state) => state.setTarget);

  const { appMode, shimmerMode, isCrisisMode, selectedDomain, liftingGated, bitchweightCount } = signals;

  useEffect(() => {
    // Priority 1: SOS / crisis — overrides everything
    if (appMode === 'sos' || isCrisisMode) {
      setTarget({ color: '#f472b6', distort: 0.9, speed: 4, metalness: 0.3, floatIntensity: 3, floatSpeed: 6 });
      return;
    }

    // Priority 2: TrickyCardio gate — lifting blocked
    // userId is always null in Phase 1 — trickycardio and bitchweights states
    // are registered but will never fire. Phase 2 wires userId through App().
    if (liftingGated) {
      setTarget({ color: '#f59e0b', distort: 0.7, speed: 3, metalness: 0.6, floatIntensity: 1.5, floatSpeed: 3 });
      return;
    }

    // Priority 3: BitchWeights stagnation flagged
    // userId is always null in Phase 1 — see Priority 2 comment above.
    if (bitchweightCount > 0) {
      setTarget({ color: '#ef4444', distort: 0.8, speed: 4, metalness: 0.7, floatIntensity: 2, floatSpeed: 4 });
      return;
    }

    // Priority 4: Domain selection (stubbed null in Phase 1)
    switch (selectedDomain) {
      case 'Iron':
        setTarget({ color: '#475569', distort: 0.5, speed: 3, metalness: 0.95, floatIntensity: 1, floatSpeed: 2 });
        return;
      case 'Road':
        setTarget({ color: '#0ea5e9', distort: 0.6, speed: 3.5, metalness: 0.5, floatIntensity: 2, floatSpeed: 3.5 });
        return;
      case 'Mat':
        setTarget({ color: '#a78bfa', distort: 0.35, speed: 1.5, metalness: 0.4, floatIntensity: 2.5, floatSpeed: 1.5 });
        return;
      case 'Hub':
        setTarget({ color: '#10b981', distort: 0.2, speed: 1.5, metalness: 0.7, floatIntensity: 1, floatSpeed: 1.5 });
        return;
    }

    // Priority 5: Default — gate idle or chill mode with shimmer mode
    if (appMode === 'gate') {
      setTarget({ color: '#1e293b', distort: 0.15, speed: 1, metalness: 0.9, floatIntensity: 0.5, floatSpeed: 1 });
      return;
    }

    // appMode === 'chill' — differentiate by shimmer mode
    if (shimmerMode === 'ETHER') {
      setTarget({ color: '#6d28d9', distort: 0.4, speed: 2.5, metalness: 0.6, floatIntensity: 1.5, floatSpeed: 2.5 });
    } else {
      setTarget({ color: '#1e293b', distort: 0.3, speed: 2, metalness: 0.8, floatIntensity: 1, floatSpeed: 2 });
    }
  }, [appMode, shimmerMode, isCrisisMode, selectedDomain, liftingGated, bitchweightCount, setTarget]);
}
