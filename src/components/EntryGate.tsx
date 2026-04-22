import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTetherState } from '../hooks/useTetherState';
import { agentLog } from '../lib/agentLog';
import { VALKYRIE_MANIFEST } from '../registry/valkyrie/manifest';

type Props = {
  onEnter: (mode: 'chill' | 'sos') => void;
};

export default function EntryGate({ onEnter }: Props) {
  const [userId, setUserId]         = useState<string | null>(null);
  const [authReady, setAuthReady]   = useState(false);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately on subscribe — handles restoration
    // of existing anonymous sessions from localStorage without a network round-trip.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        if (event === 'INITIAL_SESSION') {
          agentLog.architect(`Session restored. userId=${session.user.id}`);
        } else if (event === 'SIGNED_IN') {
          agentLog.architect(`Signed in. userId=${session.user.id}`);
          if ((session.user as { is_anonymous?: boolean }).is_anonymous) {
            agentLog.valkyrie(`Ghost operative online. Identity shielded. You're in the network.`);
          }
        }
        setAuthReady(true);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setAuthReady(true);
      }
      // INITIAL_SESSION with no session → boot() handles anonymous sign-in below
    });

    const boot = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return; // onAuthStateChange already resolved it

      // Genuinely no session — zero-friction anonymous sign-in for SOS users
      agentLog.architect(`No active session. Initiating anonymous sign-in.`);
      const { data, error } = await supabase.auth.signInAnonymously();

      if (!data.user) {
        // Auth completely unavailable — proceed untracked (Bitch-Weight guard will flag this)
        agentLog.architect(`Anonymous sign-in failed: ${error?.message ?? 'unknown error'}. Proceeding untracked.`);
        setAuthReady(true);
      }
      // On success: onAuthStateChange fires SIGNED_IN → sets userId + authReady
    };

    boot();
    return () => subscription.unsubscribe();
  }, []);

  const { triggerCrisisMode, isLoading, isUntracked, profile } = useTetherState(userId);

  // B-000 KILL SWITCH — Feu Follet Charter compliance.
  // Surfaces supabase.auth.signOut() to the user; wipes anonymous session and resets state.
  const handleReset = async () => {
    agentLog.architect(`Kill switch activated. Clearing anonymous session.`);
    await supabase.auth.signOut();
    setUserId(null);
    agentLog.valkyrie(`Ghost offline. Session cleared. Identity released from network.`);
  };

  const handleSOS = async () => {
    agentLog.architect(`SOS button activated.`);
    await triggerCrisisMode();
    agentLog.valkyrie(`SOS mode armed. Routing to minimalist experience.`);
    onEnter('sos');
  };

  const handleChill = () => {
    agentLog.architect(`Chill mode selected.`);
    agentLog.valkyrie(`${VALKYRIE_MANIFEST.title} approves. Full experience loading.`);
    onEnter('chill');
  };

  // Hold gate until auth attempt resolves so userId is stable before useTetherState runs
  if (!authReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black font-mono">
        <p className="text-[10px] tracking-[0.4em] uppercase text-slate-700 animate-pulse">
          Initializing_Protocol...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex overflow-hidden font-mono">

      {/* LEFT — CHILL MODE */}
      <div
        className="w-1/2 h-full flex flex-col justify-between p-12 bg-[#0a0a0b] border-r border-[#1e293b] cursor-pointer group"
        onClick={handleChill}
      >
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-slate-600">
            Spectre Labs / {VALKYRIE_MANIFEST.codename}
          </p>
        </div>

        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4 group-hover:text-slate-300 transition-colors">
            Chill<br />Mode
          </h2>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Full experience. Valkyrie framework active. The Queen is watching over you.
          </p>
          <p className="mt-6 text-xs text-slate-600 italic">
            "{VALKYRIE_MANIFEST.gear.helmets[0].name}" — {VALKYRIE_MANIFEST.gear.helmets[0].rarity} tier
          </p>
        </div>

        <div>
          <div className="w-full border border-[#1e293b] py-4 px-6 text-center text-xs tracking-[0.3em] uppercase text-slate-400 group-hover:border-slate-500 group-hover:text-white transition-all">
            Enter Full Mode
          </div>
          {profile && (
            <p className="mt-3 text-[10px] text-slate-700 text-center">
              handle: {profile.random_handle}
            </p>
          )}
          {isUntracked && (
            <p className="mt-3 text-[10px] text-yellow-800 text-center tracking-widest uppercase">
              Untracked session — handle not registered
            </p>
          )}
        </div>
      </div>

      {/* RIGHT — SOS MODE */}
      <div className="w-1/2 h-full flex flex-col justify-between p-12 bg-black">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#4ade80]">
            SOS / Emergency Protocol
          </p>
        </div>

        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4">
            SOS<br />Mode
          </h2>
          <p className="text-sm text-[#4ade80] max-w-xs leading-relaxed">
            No setup. No forms. Minimal friction. You will be assigned a handle automatically.
          </p>
          <p className="mt-3 text-sm text-[#f472b6]">
            Just hit the button. We handle the rest.
          </p>
        </div>

        <div>
          <button
            onClick={handleSOS}
            disabled={isLoading}
            className="
              w-full bg-[#f472b6] text-black font-black py-6 px-6
              uppercase tracking-[0.15em] text-xs leading-tight
              hover:bg-white transition-colors duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            I DON'T KNOW<br />I'M JUST LOSING IT
          </button>

          <p className="mt-4 text-[10px] text-slate-700 text-center tracking-widest uppercase">
            Tap above to activate crisis mode
          </p>

          {/* B-000 KILL SWITCH — Feu Follet Charter compliance */}
          <button
            onClick={handleReset}
            className="
              mt-6 w-full text-[10px] tracking-[0.3em] uppercase
              text-slate-800 hover:text-slate-500 transition-colors
              py-2 text-center
            "
          >
            Reset / Clear Session
          </button>
        </div>
      </div>

    </div>
  );
}
