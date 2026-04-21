import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTetherState } from '../hooks/useTetherState';
import { agentLog } from '../lib/agentLog';
import { VALKYRIE_MANIFEST } from '../registry/valkyrie/manifest';

type Props = {
  onEnter: (mode: 'chill' | 'sos') => void;
};

export default function EntryGate({ onEnter }: Props) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const resolveAuth = async () => {
      const { data: sessionData } = await supabase.auth.getUser();

      if (sessionData.user) {
        setUserId(sessionData.user.id);
        agentLog.architect(`Auth resolved. userId=${sessionData.user.id}`);
        return;
      }

      // No session — sign in anonymously for zero-friction entry (SOS users never hit a form)
      agentLog.architect(`No active session. Initiating anonymous sign-in.`);
      const { data: anonData, error } = await supabase.auth.signInAnonymously();

      if (anonData.user) {
        setUserId(anonData.user.id);
        agentLog.architect(`Anonymous session created. userId=${anonData.user.id}`);
        agentLog.valkyrie(`Ghost operative online. Identity shielded. You're in the network.`);
      } else {
        agentLog.architect(`Anonymous sign-in failed: ${error?.message ?? 'unknown error'}. Proceeding without Supabase.`);
      }
    };

    resolveAuth();
  }, []);

  const { triggerCrisisMode, isLoading, profile } = useTetherState(userId);

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
        </div>
      </div>

    </div>
  );
}
