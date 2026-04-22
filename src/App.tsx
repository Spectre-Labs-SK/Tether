import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import './index.css';
import EntryGate from './components/EntryGate';

type AppMode = 'gate' | 'chill' | 'sos';

const ShimmerCore = ({ mode, distort }: { mode: 'MILITARY' | 'ETHER'; distort: number }) => (
  <group>
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={mode === 'MILITARY' ? '#1e293b' : '#6d28d9'}
          distort={distort}
          speed={2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  </group>
);

function WarRoom() {
  const [mode, setMode] = useState<'MILITARY' | 'ETHER'>('MILITARY');
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [staticLevel, setStaticLevel] = useState(40);

  return (
    <div className="w-full h-screen bg-black overflow-hidden text-white">
      <div className="noise-overlay" />
      {!isCalibrated ? (
        <main className="relative z-10 h-full flex flex-col items-center justify-center p-6 font-mono text-emerald-500">
          <div className="w-full max-w-xl border border-emerald-950 p-10 bg-black shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]">
            <h1 className="text-xl font-black mb-8 tracking-widest uppercase italic">Synapse_Calibration</h1>
            <p className="text-[10px] mb-10 text-emerald-800 font-bold uppercase italic tracking-tighter">Bunker_B12 // Reality_Sync_Required</p>
            <div className="space-y-10">
              <input
                type="range"
                min={0}
                max={100}
                value={staticLevel}
                onChange={(e) => setStaticLevel(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <button
                onClick={() => setIsCalibrated(true)}
                className="w-full bg-emerald-500 text-black font-black py-5 uppercase tracking-[0.4em] text-xs"
              >
                Initialize_Survive_Protocol
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className={`relative h-full transition-colors duration-1000 ${mode === 'MILITARY' ? 'bg-[#0a0a0b]' : 'bg-[#0f071a]'}`}>
          <div className="absolute inset-0 z-0 h-full w-full">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={1} />
              <pointLight position={[10, 10, 10]} />
              <Suspense fallback={null}>
                <ShimmerCore mode={mode} distort={staticLevel / 100} />
              </Suspense>
            </Canvas>
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between p-12 pointer-events-none">
            <h1 className="text-2xl font-black tracking-[0.4em] uppercase opacity-50">Spectre Labs</h1>
            <h2 className="text-8xl font-black italic uppercase tracking-tighter">{mode === 'MILITARY' ? 'Shadow' : 'Ethereal'}</h2>
            <button
              onClick={() => setMode(mode === 'MILITARY' ? 'ETHER' : 'MILITARY')}
              className="pointer-events-auto w-fit bg-white text-black px-10 py-5 font-black uppercase"
            >
              Initiate Shift
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

function SOSShell() {
  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center font-mono text-[#4ade80]">
      <div className="noise-overlay" />
      <div className="relative z-10 text-center space-y-4 p-12 max-w-md">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#f472b6]">SOS / Crisis Mode Active</p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
          We've<br />Got You
        </h1>
        <p className="text-sm text-[#4ade80] leading-relaxed">
          Minimalist mode is active. No noise. Just the essentials.
        </p>
        {/* TODO: SOS onboarding / fitness module screens go here */}
      </div>
    </div>
  );
}

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('gate');

  if (appMode === 'gate') {
    return <EntryGate onEnter={(mode) => setAppMode(mode)} />;
  }

  if (appMode === 'sos') {
    return <SOSShell />;
  }

  return <WarRoom />;
}
