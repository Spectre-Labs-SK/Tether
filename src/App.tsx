import { useState, useRef, useEffect } from 'react';
import './index.css';
import EntryGate from './components/EntryGate';
import WarRoom from './components/WarRoom';

type AppMode = 'gate' | 'chill' | 'sos';

const BREATHE_PHASES: { label: string; seconds: number; color: string }[] = [
  { label: 'INHALE', seconds: 4, color: '#4ade80' },
  { label: 'HOLD',   seconds: 4, color: '#f472b6' },
  { label: 'EXHALE', seconds: 6, color: '#60a5fa' },
  { label: 'HOLD',   seconds: 2, color: '#a78bfa' },
];

function SOSShell() {
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isRunning, setIsRunning]           = useState(false);
  const [phaseIndex, setPhaseIndex]         = useState(0);
  const [phaseElapsed, setPhaseElapsed]     = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setSessionSeconds(s => s + 1);
      setPhaseElapsed(prev => {
        const phase = BREATHE_PHASES[phaseIndex];
        if (prev + 1 >= phase.seconds) {
          setPhaseIndex(i => (i + 1) % BREATHE_PHASES.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isRunning, phaseIndex]);

  const currentPhase = BREATHE_PHASES[phaseIndex];
  const phaseProgress = currentPhase.seconds - phaseElapsed;

  const formatTime = (s: number) => {
    const m   = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center font-mono text-[#4ade80]">
      <div className="noise-overlay" />
      <div className="relative z-10 text-center space-y-6 p-12 max-w-md w-full">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#f472b6]">SOS / Crisis Mode Active</p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
          We've<br />Got You
        </h1>
        <p className="text-sm text-[#4ade80] leading-relaxed">
          Minimalist mode is active. No noise. Just the essentials.
        </p>

        {isRunning ? (
          <div className="space-y-6">
            <div
              className="text-4xl font-black tracking-widest uppercase transition-colors duration-500"
              style={{ color: currentPhase.color }}
            >
              {currentPhase.label}
            </div>
            <div className="text-6xl font-black tabular-nums" style={{ color: currentPhase.color }}>
              {phaseProgress}
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-slate-600">
              Session: {formatTime(sessionSeconds)}
            </p>
            <button
              onClick={() => setIsRunning(false)}
              className="w-full border border-slate-800 py-3 text-[10px] tracking-[0.3em] uppercase text-slate-600 hover:text-slate-400 transition-colors"
            >
              Pause
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsRunning(true)}
            className="w-full bg-[#4ade80] text-black font-black py-5 uppercase tracking-[0.3em] text-xs hover:bg-white transition-colors"
          >
            {sessionSeconds > 0 ? 'Resume Breathing' : 'Begin Breathing Exercise'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [appMode, setAppMode]   = useState<AppMode>('gate');
  const [userId, setUserId]     = useState<string | null>(null);

  const handleEnter = (mode: 'chill' | 'sos', uid: string | null) => {
    setUserId(uid);
    setAppMode(mode);
  };

  const handleSignOut = () => {
    setUserId(null);
    setAppMode('gate');
  };

  if (appMode === 'gate') {
    return <EntryGate onEnter={handleEnter} />;
  }

  if (appMode === 'sos') {
    return <SOSShell />;
  }

  return <WarRoom userId={userId} onSignOut={handleSignOut} />;
}
