import { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { supabase, upgradeAnonymousUser } from "../lib/supabase";
import { useTetherState } from "../hooks/useTetherState";
import { agentLog } from "../lib/agentLog";
import { ShimmerCore } from "./ShimmerCore";
import { VALKYRIE_MANIFEST } from "../registry/valkyrie/manifest";
import FitnessOnboardingGrid from "./fitness/FitnessOnboardingGrid";

type Props = {
  userId: string | null;
  onSignOut: () => void;
};

type UpgradeState = "idle" | "open" | "submitting" | "success" | "error";

export default function WarRoom({ userId, onSignOut }: Props) {
  const [mode, setMode]           = useState<"MILITARY" | "ETHER">("MILITARY");
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [staticLevel, setStaticLevel]   = useState(40);

  // Phase A: anonymous identity detection
  const [isGhost, setIsGhost]           = useState(false);
  const [upgradeState, setUpgradeState] = useState<UpgradeState>("idle");
  const [upgradeEmail, setUpgradeEmail] = useState("");
  const [upgradePassword, setUpgradePassword] = useState("");
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const { profile, completeOnboarding, trickycardio, bitchweights } = useTetherState(userId);

  // Valkyrie gear loadout — ETHER equips PRIME gear; MILITARY equips ELITE/COMMON
  const activeHelmet = mode === "ETHER"
    ? VALKYRIE_MANIFEST.gear.helmets[0]   // Shimmer Crown [PRIME]
    : VALKYRIE_MANIFEST.gear.helmets[1];  // Shadow Visor [ELITE]
  const activeWings = mode === "ETHER"
    ? VALKYRIE_MANIFEST.gear.wings[0]     // Ethereal Flight-Span [PRIME]
    : VALKYRIE_MANIFEST.gear.wings[1];    // Carbon Thruster [COMMON]

  useEffect(() => {
    if (!userId) return;
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user as { is_anonymous?: boolean } | null;
      setIsGhost(user?.is_anonymous ?? false);
    });
  }, [userId]);

  // Phase A: Bind email/password to the existing anonymous UUID
  const handleUpgrade = async () => {
    if (!upgradeEmail || !upgradePassword) return;
    setUpgradeState("submitting");
    setUpgradeError(null);

    agentLog.architect(`Identity upgrade initiated. Binding email to anonymous UUID=${userId}`);
    const { error } = await upgradeAnonymousUser(upgradeEmail, upgradePassword);

    if (error) {
      agentLog.architect(`Identity upgrade failed: ${error.message}`);
      setUpgradeError(error.message);
      setUpgradeState("error");
    } else {
      agentLog.architect(`Identity secured. UUID preserved. Email bound.`);
      agentLog.valkyrie(`Identity secured. Welcome to the permanent network.`);
      setIsGhost(false);
      setUpgradeState("success");
    }
  };

  // Phase C: Kill switch
  const handleSignOut = async () => {
    agentLog.architect(`Sign out initiated from WarRoom.`);
    await supabase.auth.signOut();
    agentLog.valkyrie(`Operative signed out. Session cleared. Identity released from network.`);
    onSignOut();
  };

  // ── Calibration Bunker ─────────────────────────────────────────────────────
  if (!isCalibrated) {
    return (
      <div className="w-full h-screen bg-black overflow-hidden text-white">
        <div className="noise-overlay" />
        <main className="relative z-10 h-full flex flex-col items-center justify-center p-6 font-mono text-emerald-500">
          <div className="w-full max-w-xl border border-emerald-950 p-10 bg-black shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]">
            <h1 className="text-xl font-black mb-8 tracking-widest uppercase italic">
              Synapse_Calibration
            </h1>
            <p className="text-[10px] mb-10 text-emerald-800 font-bold uppercase italic tracking-tighter">
              Bunker_B12 // Reality_Sync_Required
            </p>
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
      </div>
    );
  }

  // ── War Room ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-screen bg-black overflow-hidden text-white">
      <main
        className={`relative h-full transition-colors duration-1000 ${
          mode === "MILITARY" ? "bg-[#0a0a0b]" : "bg-[#0f071a]"
        }`}
      >
        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} />
            <Suspense fallback={null}>
              <ShimmerCore mode={mode} staticLevel={staticLevel} />
            </Suspense>
          </Canvas>
        </div>

        {/* UI overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-12 pointer-events-none">
          {/* Top bar */}
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-black tracking-[0.4em] uppercase opacity-50">
              Spectre Labs
            </h1>
            <div className="text-right font-mono space-y-1">
              {profile && (
                <p className="text-[10px] tracking-widest uppercase text-slate-600">
                  {profile.random_handle}
                </p>
              )}
              <div className="space-y-0.5">
                <p className="text-[8px] tracking-[0.2em] uppercase text-slate-800">
                  {activeHelmet.name} [{activeHelmet.rarity}]
                </p>
                <p className="text-[8px] tracking-[0.2em] uppercase text-slate-800">
                  {activeWings.name} [{activeWings.rarity}]
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-8xl font-black italic uppercase tracking-tighter">
            {mode === "MILITARY" ? "Shadow" : "Ethereal"}
          </h2>

          {/* Bottom controls */}
          <div className="flex flex-col gap-4 pointer-events-auto">
            {isGhost && upgradeState === "idle" && (
              <button
                onClick={() => setUpgradeState("open")}
                className="
                  w-fit border border-yellow-900 bg-yellow-950/30 px-6 py-3
                  text-[10px] tracking-[0.3em] uppercase text-yellow-600 font-mono
                  hover:border-yellow-700 hover:text-yellow-400 transition-all
                "
              >
                [WARNING: DATA VOLATILE] SECURE IDENTITY →
              </button>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setMode(mode === "MILITARY" ? "ETHER" : "MILITARY")}
                className="bg-white text-black px-10 py-5 font-black uppercase"
              >
                Initiate Shift
              </button>
              <button
                onClick={handleSignOut}
                className="
                  border border-slate-800 px-6 py-5
                  text-[10px] tracking-[0.3em] uppercase text-slate-700 font-mono
                  hover:text-slate-400 hover:border-slate-600 transition-all
                "
              >
                SIGN OUT / ABANDON POST
              </button>
            </div>
          </div>
        </div>

        {/* Phase A: Identity upgrade modal — z-20 */}
        {upgradeState !== "idle" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 font-mono p-6">
            <div className="w-full max-w-md border border-yellow-900 bg-black p-10 shadow-[0_0_60px_-10px_rgba(234,179,8,0.15)]">
              {upgradeState === "success" ? (
                <div className="space-y-6 text-center">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-yellow-600">IDENTITY_BOUND</p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                    Operative<br />Secured
                  </h2>
                  <p className="text-sm text-emerald-500 leading-relaxed">
                    Identity secured. Welcome to the permanent network.
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Your handle, session data, and history are intact.
                  </p>
                  <button
                    onClick={() => setUpgradeState("idle")}
                    className="
                      w-full border border-emerald-900 py-3
                      text-[10px] tracking-[0.3em] uppercase text-emerald-600
                      hover:text-emerald-400 transition-colors
                    "
                  >
                    RETURN TO WAR ROOM
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] tracking-[0.4em] uppercase text-yellow-600 mb-2">
                      IDENTITY_REGISTRATION_PROTOCOL
                    </p>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">
                      Encrypt Credentials
                    </h2>
                    <p className="text-[10px] text-slate-600 mt-2">Anonymous UUID preserved. Zero data lost.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] tracking-[0.3em] uppercase text-slate-600 mb-2">EMAIL</label>
                      <input
                        type="email"
                        value={upgradeEmail}
                        onChange={(e) => setUpgradeEmail(e.target.value)}
                        placeholder="operative@domain.net"
                        disabled={upgradeState === "submitting"}
                        autoComplete="email"
                        className="
                          w-full bg-transparent border border-slate-800 px-4 py-3
                          text-xs text-white font-mono placeholder:text-slate-700
                          focus:outline-none focus:border-yellow-900 disabled:opacity-40
                        "
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.3em] uppercase text-slate-600 mb-2">PASSPHRASE</label>
                      <input
                        type="password"
                        value={upgradePassword}
                        onChange={(e) => setUpgradePassword(e.target.value)}
                        placeholder="••••••••••••"
                        disabled={upgradeState === "submitting"}
                        autoComplete="new-password"
                        className="
                          w-full bg-transparent border border-slate-800 px-4 py-3
                          text-xs text-white font-mono placeholder:text-slate-700
                          focus:outline-none focus:border-yellow-900 disabled:opacity-40
                        "
                      />
                    </div>
                  </div>
                  {upgradeError && (
                    <p className="text-[10px] text-red-600 tracking-widest uppercase">{upgradeError}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpgrade}
                      disabled={upgradeState === "submitting" || !upgradeEmail || !upgradePassword}
                      className="
                        flex-1 bg-yellow-600 text-black font-black py-4
                        uppercase tracking-[0.2em] text-xs
                        hover:bg-yellow-400 transition-colors
                        disabled:opacity-40 disabled:cursor-not-allowed
                      "
                    >
                      {upgradeState === "submitting" ? "BINDING..." : "BIND IDENTITY"}
                    </button>
                    <button
                      onClick={() => { setUpgradeState("idle"); setUpgradeError(null); }}
                      disabled={upgradeState === "submitting"}
                      className="
                        border border-slate-800 px-6 py-4
                        text-[10px] tracking-[0.3em] uppercase text-slate-600
                        hover:text-slate-400 transition-colors disabled:opacity-40
                      "
                    >
                      ABORT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* First Mission Brief — shown when profile.onboarding_pending = true — z-30 */}
        {profile?.onboarding_pending && (
          <div className="absolute inset-0 z-30 bg-black flex flex-col">
            <div className="border-b border-slate-900 px-8 py-4 flex items-center justify-between font-mono flex-shrink-0">
              <p className="text-[10px] tracking-[0.4em] uppercase text-slate-600">
                TETHER // FIRST_MISSION_BRIEF
              </p>
              <p className="text-[10px] tracking-[0.3em] uppercase text-emerald-900">
                Lock in your first protocol
              </p>
            </div>
            <div className="flex-1 min-h-0 bg-black">
              <FitnessOnboardingGrid
                trickycardio={trickycardio}
                bitchweights={bitchweights}
                onComplete={completeOnboarding}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
