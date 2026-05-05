import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { agentLog } from '../lib/agentLog';
import { VALKYRIE_MANIFEST } from '../registry/valkyrie/manifest';

const AUTH_TIMEOUT_MS = 3000;

type Props = {
  onEnter: (mode: 'chill' | 'sos', userId: string | null) => void;
};

type ConnState = 'connecting' | 'online' | 'offline';

export default function BunkerGate({ onEnter }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [conn, setConn]     = useState<ConnState>('connecting');
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hard timeout — gate never blocks on Supabase availability
    timerRef.current = setTimeout(() => {
      agentLog.architect(`Bunker: auth timeout (${AUTH_TIMEOUT_MS}ms) — entering offline mode.`);
      setConn(prev => (prev === 'connecting' ? 'offline' : prev));
    }, AUTH_TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setUserId(session.user.id);
        setConn('online');
        agentLog.architect(`Bunker: ${event} userId=${session.user.id}`);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setConn('offline');
      }
    });

    const boot = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return; // onAuthStateChange already resolved it

      agentLog.architect('Bunker: no session. Attempting anonymous sign-in.');
      await supabase.auth.signInAnonymously();
      // Success → onAuthStateChange fires SIGNED_IN → clears timer, sets online
      // Failure → timer will transition to offline
    };

    boot().catch(() => {
      // Network failure — timer handles the offline transition
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChill = () => {
    agentLog.architect(`Bunker: entering chill. conn=${conn} userId=${userId ?? 'null'}`);
    agentLog.valkyrie(`${VALKYRIE_MANIFEST.title} active. Running local. Sync when ready.`);
    onEnter('chill', userId);
  };

  const handleSOS = () => {
    agentLog.architect(`Bunker: SOS activated. conn=${conn} userId=${userId ?? 'null'}`);
    if (userId) {
      const handle = `ghost-${Math.floor(Math.random() * 9999)}`;
      // Fire-and-forget — never block the crisis path on Supabase availability
      supabase
        .from('profiles')
        .upsert({ id: userId, random_handle: handle, is_crisis_mode: true, onboarding_pending: true })
        .then(({ error }) => {
          if (error) agentLog.architect(`Bunker SOS upsert failed (non-blocking): ${error.message}`);
        });
      agentLog.valkyrie(`SOS handle assigned: ${handle}. Entering crisis mode.`);
    }
    onEnter('sos', userId);
  };

  const badge: Record<ConnState, { label: string; cls: string }> = {
    connecting: { label: 'CONNECTING...', cls: 'text-slate-600 animate-pulse' },
    online:     { label: 'UPLINK ACTIVE',  cls: 'text-[#4ade80]' },
    offline:    { label: 'OFFLINE · LOCAL', cls: 'text-yellow-700' },
  };
  const { label, cls } = badge[conn];

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden font-mono">

      {/* Status bar */}
      <div className="flex-none flex items-center justify-between px-8 py-3 border-b border-[#1e293b] bg-[#0a0a0b]">
        <span className="text-[9px] tracking-[0.5em] uppercase text-slate-700">
          BUNKER_PROTOCOL
        </span>
        <span className={`text-[9px] tracking-[0.4em] uppercase ${cls}`}>
          {label}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — CHILL */}
        <div
          className="w-1/2 h-full flex flex-col justify-between p-12 bg-[#0a0a0b] border-r border-[#1e293b] cursor-pointer group"
          onClick={handleChill}
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-slate-600">
            Spectre Labs / {VALKYRIE_MANIFEST.codename}
          </p>

          <div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4 group-hover:text-slate-300 transition-colors">
              Chill<br />Mode
            </h2>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Full experience. Valkyrie framework active.
            </p>
            {conn === 'offline' && (
              <p className="mt-3 text-xs text-yellow-700">
                Running on local assets — Supabase sync pending.
              </p>
            )}
          </div>

          <div className="w-full border border-[#1e293b] py-4 px-6 text-center text-xs tracking-[0.3em] uppercase text-slate-400 group-hover:border-slate-500 group-hover:text-white transition-all">
            Enter Full Mode
          </div>
        </div>

        {/* RIGHT — SOS */}
        <div className="w-1/2 h-full flex flex-col justify-between p-12 bg-black">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#4ade80]">
            SOS / Emergency Protocol
          </p>

          <div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4">
              SOS<br />Mode
            </h2>
            <p className="text-sm text-[#4ade80] max-w-xs leading-relaxed">
              No setup. No forms. Minimal friction.
            </p>
            <p className="mt-3 text-sm text-[#f472b6]">
              Just hit the button. We handle the rest.
            </p>
          </div>

          <div>
            <button
              onClick={handleSOS}
              className="
                w-full bg-[#f472b6] text-black font-black py-6 px-6
                uppercase tracking-[0.15em] text-xs leading-tight
                hover:bg-white transition-colors duration-200
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
    </div>
  );
}
