import { useState, useEffect, useCallback, useRef } from 'react';

// Define the secret sequence (e.g., Left, Right, Left regions)
const BUNKER_SEQUENCE = [1, 2, 1];
const TAP_TIMEOUT_MS = 1500;

export const useBunkerTap = (onSequenceMatch: () => void) => {
    const [tapPattern, setTapPattern] = useState<number[]>([]);
    const tapPatternRef = useRef<number[]>([]);

    useEffect(() => {
        if (tapPattern.length === 0) return;

        const timer = setTimeout(() => {
            tapPatternRef.current = [];
            setTapPattern([]);
        }, TAP_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [tapPattern]);

    const registerTap = useCallback((regionId: number) => {
        const next = [...tapPatternRef.current, regionId];

        if (next.join(',') === BUNKER_SEQUENCE.join(',')) {
            tapPatternRef.current = [];
            setTapPattern([]);
            onSequenceMatch();
            return;
        }

        if (next.length >= BUNKER_SEQUENCE.length) {
            tapPatternRef.current = [];
            setTapPattern([]);
            return;
        }

        tapPatternRef.current = next;
        setTapPattern(next);
    }, [onSequenceMatch]);

    return { registerTap };
};
