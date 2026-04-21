import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Float, PerspectiveCamera } from '@react-three/drei';
import { Shield, Sparkles, Brain, Zap } from 'lucide-react';
import './index.css';

const ShimmerCore = ({ mode }: { mode: 'MILITARY' | 'ETHER' }) => (
  <group>
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={mode === 'MILITARY' ? '#1e293b' : '#6d28d9'}
          distort={0.4}
          speed={2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  </group>
);

export default function App() {
  const [mode, setMode] = useState<'MILITARY' | 'ETHER'>('MILITARY');
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [staticLevel, setStaticLevel] = useState(50);

  return (
    <div className="w-full h-screen bg-black overflow-hidden text-white">
      <div className="noise-overlay" />

      {!isCalibrated ? (
        /* SCREEN 1: THE BUNKER (2D ONLY - NO CRASH RISK) */
        <main className="relative z-10 h-full flex flex-col items-center justify-center p-6 font-mono text-emerald-500">
          <div className="w-full max-w-xl border border-emerald-950 p-10 bg-black shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]">
            <h1 className="text-xl font-black mb-8 tracking-widest uppercase italic">Synapse_Calibration</h1>
            <p className="text-[10px] mb-10 text-emerald-800 font-bold uppercase italic tracking-tighter">Bunker_B12 // Reality_Sync_Required</p>
            
            <div className="space-y-10">
              <input type="range" className="w-full accent-emerald-500" onChange={(e) => setStaticLevel(parseInt(e.target.value))} />
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
        /* SCREEN 2: THE WAR ROOM (3D ENABLED) */
        <main className={`relative h-full transition-colors duration-1000 ${mode === 'MILITARY' ? 'bg-[#0a0a0b]' : 'bg-[#0f071a]'}`}>
          <div className="absolute inset-0 z-0 h-full w-full">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={1} />
              <pointLight position={[10, 10, 10]} />
              <Suspense fallback={null}>
                <ShimmerCore mode={mode} />
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