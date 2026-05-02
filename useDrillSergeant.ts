import { useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '../lib/haptics'; // Assumes abstracted haptic engine
import { getStepCount } from '../lib/health/garmin'; // Assumes abstracted Garmin SDK
import { pauseSpotify, resumeSpotify } from '../lib/media/spotify'; // Assumes abstracted Spotify SDK

export const useDrillSergeant = (isActive: boolean) => {
    const [stepsLogged, setStepsLogged] = useState(0);
    const loopRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isActive) {
            if (loopRef.current) clearInterval(loopRef.current);
            return;
        }

        // Silent execution: No UI notifications, just raw hardware interrupts
        const startProtocol = async () => {
            // Baseline the step count at the start of the alarm
            const initialSteps = await getStepCount();

            loopRef.current = setInterval(async () => {
                const currentSteps = await getStepCount();
                const delta = currentSteps - initialSteps;
                setStepsLogged(delta);

                if (delta < 50) {
                    // Drill Sergeant Loop: Relentless haptic barrage, pause media
                    // Does NOT stop until step delta is >= 50
                    triggerHaptic('CRITICAL_PULSE');
                    await pauseSpotify();
                } else {
                    // Target reached: Cease haptics, restore media
                    if (loopRef.current) clearInterval(loopRef.current);
                    triggerHaptic('SUCCESS_BURST');
                    await resumeSpotify();
                }
            }, 5000); // 5-second polling interval
        };

        startProtocol();

        return () => {
            if (loopRef.current) clearInterval(loopRef.current);
            resumeSpotify().catch(() => { }); // Failsafe cleanup
        };
    }, [isActive]);

    return { stepsLogged, isComplete: stepsLogged >= 50 };
};