import { useState, useEffect, useCallback } from 'react';

// Define the secret sequence (e.g., Left, Right, Left regions)
const BUNKER_SEQUENCE = [1, 2, 1];
const TAP_TIMEOUT_MS = 1500;

export const useBunkerTap = (onSequenceMatch: () => void) => {
    const [tapPattern, setTapPattern] = useState<number[]>([]);

    useEffect(() => {
        if (tapPattern.length === 0) return;

        // Check for exact sequence match
        if (tapPattern.join(',') === BUNKER_SEQUENCE.join(',')) {
            onSequenceMatch();
            setTapPattern([]);
            return;
        }

        // Clear pattern if it gets too long without a match
        if (tapPattern.length >= BUNKER_SEQUENCE.length) {
            setTapPattern([]);
        }

        const timer = setTimeout(() => setTapPattern([]), TAP_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [tapPattern, onSequenceMatch]);

    const registerTap = useCallback((regionId: number) => {
        setTapPattern((prev) => [...prev, regionId]);
    }, []);

    return { registerTap };
};