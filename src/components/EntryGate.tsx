import { useEffect, useState } from 'react';
import { supabase, signInWithEmailPassword } from '../lib/supabase';
import { useTetherState } from '../hooks/useTetherState';
import { agentLog } from '../lib/agentLog';
import { VALKYRIE_MANIFEST } from '../registry/valkyrie/manifest';

type Props = {
  onEnter: (mode: 'chill' | 'sos', userId: string | null) => void;
};

type View = 'gate' | 'login';
type LoginState = 'idle' | 'submitting' | 'error';

export default function EntryGate({ onEnter }: Props) {
  const [userId, setUserId]         = useState<string | null>(null);
  const [authReady, setAuthReady]   = useState(false);

  // Phase B: recovery view state
  const [view, setView]             = useState<View>('gate');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately — restores existing anonymous
    // sessions from localStorage without a network round-trip.
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
    });

    const boot = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return; // onAuthStateChange already resolved it

      // No session — zero-friction anonymous sign-in for SOS users
      agentLog.architect(`No active session. Initiating anonymous sign-in.`);
      const { data, error } = await supabase.auth.signInAnonymously();

      if (!data.user) {
        // Auth unavailable — proceed untracked (Bitch-Weight guard flags this)
        agentLog.architect(`Anonymous sign-in failed: ${error?.message ?? 'unknown error'}. Proceeding untracked.`);
        setAuthReady(true);
      }
      // On success: onAuthStateChange fires SIGNED_IN → sets userId + authReady
    };

    boot();
    return () => subscription.unsubscribe();
  }, []);

  const { triggerCrisisMode, isLoading, isUntracked, profile } = useTetherState(userId);

  // B-000 kill switch — clears anonymous session and resets state
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
    onEnter('sos', userId);
  };

  const handleChill = () => {
    agentLog.architect(`Chill mode selected.`);
    agentLog.valkyrie(`${VALKYRIE_MANIFEST.title} approves. Full experience loading.`);
    onEnter('chill', userId);
  };

  // Phase B: sign in returning operative and route to War Room
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return;
    setLoginState('submitting');
    setLoginError(null);

    agentLog.architect(`Recovery path: signing in existing operative.`);
    const { data, error } = await signInWithEmailPassword(loginEmail, loginPassword);

    if (error || !data.user) {
      agentLog.architect(`Recovery failed: ${error?.message ?? 'unknown error'}`);
      setLoginError(error?.message ?? 'Authentication failed. Check your credentials.');
      setLoginState('error');
    } else {
      agentLog.architect(`Operative restored. userId=${data.user.id}`);
      agentLog.valkyrie(`Session restored. Welcome back, operative. All your history is intact.`);
      setUserId(data.user.id);
      onEnter('chill', data.user.id);
    }
  };

  // Hold gate until auth attempt resolves
  if (!authReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black font-mono">
        <p className="text-[10px] tracking-[0.4em] uppercase text-slate-700 animate-pulse">
          Initializing_Protocol...
        </p>
      </div>
    );
  }

  // ── Phase B: Recovery login view ───────────────────────────────────────────
  if (view === 'login') {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black font-mono p-6">
        <div className="w-full max-w-md border border-slate-800 bg-[#0a0a0b] p-10">
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-600 mb-2">
              OPERATIVE_RESTORE_PROTOCOL
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
              Recover<br />Session
            </h2>
            <p className="text-[10px] text-slate-600 mt-2">
              Enter credentials to restore your history on this device.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-[10px] tracking-[0.3em] uppercase text-slate-600 mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="operative@domain.net"
                disabled={loginState === 'submitting'}
                autoComplete="email"
                className="
                  w-full bg-transparent border border-slate-800 px-4 py-3
                  text-xs text-white font-mono placeholder:text-slate-700
                  focus:outline-none focus:border-slate-600 disabled:opacity-40
                "
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.3em] uppercase text-slate-600 mb-2">
                PASSPHRASE
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loginState === 'submitting'}
                autoComplete="current-password"
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                className="
                  w-full bg-transparent border border-slate-800 px-4 py-3
                  text-xs text-white font-mono placeholder:text-slate-700
                  focus:outline-none focus:border-slate-600 disabled:opacity-40
                "
              />
            </div>
          </div>

          {loginError && (
            <p className="mb-6 text-[10px] text-red-600 tracking-widest uppercase">
              {loginError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleLogin}
              disabled={loginState === 'submitting' || !loginEmail || !loginPassword}
              className="
                flex-1 bg-white text-black font-black py-4
                uppercase tracking-[0.2em] text-xs
                hover:bg-slate-200 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {loginState === 'submitting' ? 'VERIFYING...' : 'VERIFY IDENTITY'}
            </button>
            <button
              onClick={() => { setView('gate'); setLoginError(null); }}
              disabled={loginState === 'submitting'}
              className="
                border border-slate-800 px-6 py-4
                text-[10px] tracking-[0.3em] uppercase text-slate-600
                hover:text-slate-400 transition-colors disabled:opacity-40
              "
            >
              BACK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main gate: Chill | SOS ─────────────────────────────────────────────────
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden font-mono">

      <div className="flex flex-1 overflow-hidden">
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

      {/* Phase B: Returning operative footer link */}
      <div className="flex-none border-t border-[#1e293b] bg-[#0a0a0b] px-12 py-4 flex justify-center">
        <button
          onClick={() => setView('login')}
          className="text-[10px] tracking-[0.3em] uppercase text-slate-700 hover:text-slate-400 transition-colors"
        >
          EXISTING OPERATIVE? [RESTORE SESSION]
        </button>
      </div>

    </div>
  );
}
