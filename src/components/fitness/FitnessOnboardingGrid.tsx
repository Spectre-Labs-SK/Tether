import { useState, useRef, useEffect } from "react";
import { agentLog } from "../../lib/agentLog";
import type { BitchWeightFlag, TrickyCardioGate } from "../../hooks/useTetherState";
import PushDaySession from "./PushDaySession";

type Domain = "Iron" | "Road" | "Mat" | "Hub";

interface Activity {
  id: string;
  name: string;
  domain: Domain;
  description: string;
}

interface DomainDef {
  name: Domain;
  code: string;
  protocol: string;
  accent: string;
  activities: Activity[];
}

const DOMAIN_REGISTRY: DomainDef[] = [
  {
    name: "Iron",
    code: "[Fe]",
    protocol: "Strength Protocol",
    accent: "#ef4444",
    activities: [
      { id: "push",      name: "Push Day",  domain: "Iron", description: "Chest · Shoulders · Triceps" },
      { id: "pull",      name: "Pull Day",  domain: "Iron", description: "Back · Biceps" },
      { id: "legs",      name: "Leg Day",   domain: "Iron", description: "Quads · Hamstrings · Calves" },
      { id: "full_body", name: "Full Body", domain: "Iron", description: "Compound movements" },
    ],
  },
  {
    name: "Road",
    code: "[//]",
    protocol: "Cardio Protocol",
    accent: "#3b82f6",
    activities: [
      { id: "run_steady",     name: "Steady Run",     domain: "Road", description: "Consistent pace run" },
      { id: "run_interval",   name: "Interval Run",   domain: "Road", description: "Varying intensity run" },
      { id: "cycle_steady",   name: "Steady Cycle",   domain: "Road", description: "Consistent pace ride" },
      { id: "cycle_interval", name: "Interval Cycle", domain: "Road", description: "Varying intensity ride" },
    ],
  },
  {
    name: "Mat",
    code: "[~~]",
    protocol: "Flexibility Protocol",
    accent: "#10b981",
    activities: [
      { id: "yoga_flow",           name: "Yoga Flow",          domain: "Mat", description: "Dynamic vinyasa sequence" },
      { id: "bodyweight_strength", name: "Bodyweight Circuit", domain: "Mat", description: "Strength-focused calisthenics" },
      { id: "stretching",          name: "Deep Stretch",       domain: "Mat", description: "Static and dynamic stretching" },
    ],
  },
  {
    name: "Hub",
    code: "[::]",
    protocol: "Recovery Protocol",
    accent: "#8b5cf6",
    activities: [
      { id: "desk_session", name: "Desk Session", domain: "Hub", description: "Track movement at your desk" },
    ],
  },
];

type Step = "domain" | "activity" | "checking" | "cardio-gate" | "amrap-briefing" | "time-check" | "session-active";

type Props = {
  trickycardio: () => Promise<TrickyCardioGate>;
  bitchweights: () => Promise<BitchWeightFlag[]>;
  onComplete: () => Promise<void>;
};

export default function FitnessOnboardingGrid({ trickycardio, bitchweights, onComplete }: Props) {
  const [step, setStep]                         = useState<Step>("domain");
  const [selectedDomain, setSelectedDomain]     = useState<DomainDef | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [cardioGate, setCardioGate]             = useState<TrickyCardioGate | null>(null);
  const [amrapFlags, setAmrapFlags]             = useState<BitchWeightFlag[]>([]);
  const [sessionSeconds, setSessionSeconds]     = useState(0);
  const [isEnding, setIsEnding]                 = useState(false);
  const [hardStop, setHardStop]                 = useState<string>("");
  const [compressionStatus, setCompressionStatus] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step !== "session-active") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setSessionSeconds(s => {
        const next = s + 1;
        if (hardStop && next % 10 === 0) {
           const now = new Date();
           const [hsHours, hsMinutes] = hardStop.split(':').map(Number);
           const stopDate = new Date();
           stopDate.setHours(hsHours, hsMinutes, 0, 0);
           if (stopDate < now) stopDate.setDate(stopDate.getDate() + 1);
           const minsRemaining = Math.floor((stopDate.getTime() - now.getTime()) / 60000);
           if (minsRemaining <= 15 && minsRemaining > 5) {
             setCompressionStatus("VOLUME REDUCTION: FINAL SETS TRUNCATED");
           } else if (minsRemaining <= 5 && minsRemaining > 0) {
             setCompressionStatus("CRITICAL: 5 MIN TO EXTRACTION. INITIATE COOL DOWN.");
           } else if (minsRemaining <= 0) {
             setCompressionStatus("EXTRACTION TIME REACHED. TERMINATE PROTOCOL.");
           } else {
             setCompressionStatus(null);
           }
        }
        return next;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [step, hardStop]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  // TAP 1: Domain
  const handleDomainSelect = (domain: DomainDef) => {
    agentLog.architect(`Domain selected: ${domain.name}`);
    setSelectedDomain(domain);
    if (domain.name === "Hub") {
      agentLog.valkyrie("Hub domain engaged. Desk protocol active.");
      setSelectedActivity(domain.activities[0]);
      setStep("time-check");
    } else {
      setStep("activity");
    }
  };

  // TAP 2: Activity + AI Gate Evaluation
  const handleActivitySelect = async (activity: Activity) => {
    agentLog.architect(`Activity selected: ${activity.name} [${activity.domain}]`);
    setSelectedActivity(activity);

    if (activity.domain === "Iron") {
      setStep("checking");

      const gate = await trickycardio();
      setCardioGate(gate);
      if (gate.liftingGated) {
        setStep("cardio-gate");
        return;
      }

      const flags = await bitchweights();
      setAmrapFlags(flags);
      if (flags.length > 0) {
        setStep("amrap-briefing");
      } else {
        agentLog.valkyrie("All systems clear. Session authorized. Begin.");
        setStep("time-check");
      }
    } else {
      agentLog.valkyrie(`${activity.domain} domain cleared. Session authorized.`);
      setStep("time-check");
    }
  };

  const handleBack = () => {
    setStep("domain");
    setSelectedDomain(null);
    setSelectedActivity(null);
    setCardioGate(null);
    setAmrapFlags([]);
    setSessionSeconds(0);
    setIsEnding(false);
    setHardStop("");
    setCompressionStatus(null);
  };

  // TAP 3: End Session
  const handleEndSession = async () => {
    if (isEnding) return;
    setIsEnding(true);
    agentLog.architect(`Session ended: ${selectedActivity?.name} — ${formatTime(sessionSeconds)}`);
    agentLog.valkyrie(`Mission complete. ${formatTime(sessionSeconds)} logged. The Queen acknowledges your effort.`);
    await onComplete();
  };

  // RENDER: Domain Grid
  if (step === "domain") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 font-mono">
        <p className="text-[10px] tracking-[0.4em] uppercase text-slate-600 mb-2">
          TETHER // DOMAIN_SELECT
        </p>
        <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-10">
          Select Protocol
        </h1>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {DOMAIN_REGISTRY.map((domain) => (
            <button
              key={domain.name}
              onClick={() => handleDomainSelect(domain)}
              style={{ borderColor: domain.accent + "33" }}
              className="
                aspect-square flex flex-col items-center justify-center gap-3
                bg-[#0f172a] border p-6
                hover:bg-[#1e293b] transition-all duration-200
                group relative overflow-hidden
              "
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${domain.accent}10 0%, transparent 70%)` }}
              />
              <span className="text-[11px] font-black tracking-widest" style={{ color: domain.accent }}>
                {domain.code}
              </span>
              <span className="text-lg font-black uppercase tracking-wider text-white">
                {domain.name}
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-slate-600">
                {domain.protocol}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // RENDER: Activity List
  if (step === "activity" && selectedDomain) {
    return (
      <div className="w-full h-full flex flex-col p-8 font-mono">
        <button
          onClick={handleBack}
          className="text-[10px] tracking-[0.3em] uppercase text-slate-600 hover:text-slate-400 mb-8 text-left transition-colors w-fit"
        >
          ‹ ABORT / RETURN
        </button>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: selectedDomain.accent }}>
          {selectedDomain.name} // ACTIVITY_SELECT
        </p>
        <h1 className="text-xl font-black uppercase tracking-widest text-white mb-8">Choose Focus</h1>
        <div className="space-y-3 flex-1 overflow-auto">
          {selectedDomain.activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => handleActivitySelect(activity)}
              className="
                w-full flex items-center justify-between
                bg-[#0f172a] border border-slate-800 px-6 py-5 text-left
                hover:border-slate-600 hover:bg-[#1e293b] transition-all duration-150 group
              "
            >
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-white group-hover:text-emerald-400 transition-colors">
                  {activity.name}
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-slate-600 mt-1">
                  {activity.description}
                </p>
              </div>
              <span className="text-slate-700 group-hover:text-slate-400 text-lg transition-colors">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // RENDER: AI Clearance Check
  if (step === "checking") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 font-mono text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-emerald-800 mb-8 animate-pulse">
          RUNNING AI CLEARANCE PROTOCOL...
        </p>
        <div className="space-y-3 text-left max-w-xs w-full">
          <p className="text-[10px] text-emerald-800">&gt; trickycardio() — evaluating HR window</p>
          <p className="text-[10px] text-emerald-800">&gt; bitchweights() — scanning 6wk 1RM delta</p>
          <p className="text-[10px] text-slate-700 animate-pulse">&gt; awaiting clearance_</p>
        </div>
      </div>
    );
  }

  // RENDER: Cardio Gate Block
  if (step === "cardio-gate" && cardioGate) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 font-mono">
        <div className="w-full max-w-sm border border-red-950 bg-[#0f172a] p-8 shadow-[0_0_60px_-15px_rgba(239,68,68,0.15)]">
          <p className="text-[10px] tracking-[0.4em] uppercase text-red-700 mb-4">
            TRICKYCARDIO // ACCESS_DENIED
          </p>
          <h2 className="text-xl font-black uppercase tracking-tight text-white mb-6">
            Cardio Gate<br />Locked
          </h2>
          <div className="space-y-2 mb-6 font-mono text-[10px]">
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-700 uppercase tracking-widest">Required</span>
              <span className="text-white">{cardioGate.requiredMinutes} min @ {cardioGate.thresholdBpm}bpm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 uppercase tracking-widest">Logged (45 min)</span>
              <span className={cardioGate.minutesAtThreshold > 0 ? "text-yellow-600" : "text-red-700"}>
                {cardioGate.minutesAtThreshold} min
              </span>
            </div>
          </div>
          <p className="text-[9px] text-slate-700 leading-relaxed mb-8 italic border-l-2 border-slate-900 pl-3">
            "Get your heart rate up before you touch those weights." — Valkyrie
          </p>
          <button
            onClick={handleBack}
            className="
              w-full border border-red-950 py-4
              text-[10px] tracking-[0.3em] uppercase text-red-900
              hover:text-red-600 hover:border-red-800 transition-colors
            "
          >
            SELECT DIFFERENT PROTOCOL
          </button>
        </div>
      </div>
    );
  }

  // RENDER: AMRAP Briefing
  if (step === "amrap-briefing") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 font-mono">
        <div className="w-full max-w-sm">
          <p className="text-[10px] tracking-[0.4em] uppercase text-yellow-700 mb-4">
            BITCHWEIGHTS // STAGNATION_DETECTED
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
            AMRAP Mode<br />Engaged
          </h2>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-6">
            The following lifts show &lt;2% 1RM growth over 6 weeks.<br />
            Prescribed sets are now AMRAP. No more comfortable sets.
          </p>
          <div className="space-y-2 mb-8">
            {amrapFlags.map((flag) => (
              <div key={flag.exercise_id} className="border border-yellow-950 bg-[#0f172a] p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-yellow-600">
                  {flag.exercise_id.replace(/^ex-/, "").replace(/-\d+$/, "").replace(/-/g, " ")}
                </p>
                <div className="flex gap-6 mt-2">
                  <div>
                    <p className="text-[8px] tracking-[0.2em] uppercase text-slate-700">1RM</p>
                    <p className="text-sm font-black text-white">{flag.current_1rm_kg}kg</p>
                  </div>
                  <div>
                    <p className="text-[8px] tracking-[0.2em] uppercase text-slate-700">6wk Delta</p>
                    <p className="text-sm font-black text-red-500">{flag.delta_pct.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-yellow-900 italic mb-6 leading-relaxed border-l-2 border-yellow-950 pl-4">
            "Stagnation detected. AMRAP mode engaged. No more comfortable sets." — Valkyrie
          </p>
          <button
            onClick={() => setStep("time-check")}
            className="w-full bg-yellow-600 text-black font-black py-4 uppercase tracking-[0.3em] text-xs hover:bg-yellow-400 transition-colors"
          >
            ACKNOWLEDGED — CONTINUE
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Time Check (Hard Stop)
  if (step === "time-check") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 font-mono">
        <div className="w-full max-w-sm border border-slate-800 bg-[#0f172a] p-8">
          <p className="text-[10px] tracking-[0.4em] uppercase text-emerald-600 mb-4 animate-pulse">
            TIME // EXTRACTION_PROTOCOL
          </p>
          <h2 className="text-xl font-black uppercase tracking-tight text-white mb-4">
            Hard Stop Time
          </h2>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-6">
            Enter your extraction time (e.g. 18:30 or 06:30 PM). Leave blank for open-ended protocol.
            The AI will dynamically compress rest periods or truncate volume to ensure you hit your extraction window.
          </p>
          <input
            type="time"
            value={hardStop}
            onChange={(e) => setHardStop(e.target.value)}
            className="w-full bg-black border border-slate-700 px-4 py-4 text-white font-mono text-center mb-6 focus:outline-none focus:border-emerald-700"
          />
          <button
            onClick={() => {
              if (hardStop) {
                agentLog.architect(`Hard stop set for ${hardStop}. Compressing protocol.`);
                agentLog.valkyrie(`Extraction locked at ${hardStop}. Adjusting volume and rests. Keep moving.`);
              } else {
                agentLog.valkyrie(`Open-ended protocol authorized. Execute at will.`);
              }
              setStep("session-active");
            }}
            className="w-full bg-emerald-600 text-black font-black py-4 uppercase tracking-[0.3em] text-xs hover:bg-emerald-400 transition-colors"
          >
            ENGAGE PROTOCOL
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Session Active
  if (selectedActivity?.id === "push") {
    return (
      <PushDaySession
        hardStop={hardStop}
        compressionStatus={compressionStatus}
        sessionSeconds={sessionSeconds}
        formatTime={formatTime}
        onComplete={handleEndSession}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 font-mono text-center">
      <div className="space-y-8 w-full max-w-xs">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-emerald-700 mb-2">
            SESSION_ACTIVE // {selectedDomain?.name.toUpperCase()}
          </p>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">
            {selectedActivity?.name}
          </h2>
          <p className="text-[10px] tracking-[0.2em] uppercase text-slate-600 mt-1">
            {selectedActivity?.description}
          </p>
        </div>

        {amrapFlags.length > 0 && (
          <div className="border border-yellow-950 px-6 py-3">
            <p className="text-[9px] tracking-[0.3em] uppercase text-yellow-800">
              AMRAP ACTIVE — {amrapFlags.length} LIFT{amrapFlags.length > 1 ? "S" : ""} FLAGGED
            </p>
          </div>
        )}

        {hardStop && (
          <div className="border border-emerald-950 px-6 py-3">
            <p className="text-[9px] tracking-[0.3em] uppercase text-emerald-800">
              EXTRACTION TIME: {hardStop}
            </p>
            {compressionStatus && (
              <p className={`text-[9px] tracking-[0.2em] mt-2 font-black ${
                compressionStatus.includes("CRITICAL") || compressionStatus.includes("TERMINATE") 
                  ? "text-red-600 animate-pulse" 
                  : "text-yellow-600"
              }`}>
                &gt; {compressionStatus}
              </p>
            )}
          </div>
        )}

        <div className="text-7xl font-black tabular-nums text-emerald-400 tracking-tighter">
          {formatTime(sessionSeconds)}
        </div>

        <p className="text-[9px] tracking-[0.3em] uppercase text-slate-700">Time on target</p>

        <button
          onClick={handleEndSession}
          disabled={isEnding}
          className={`
            w-full border py-5 text-[10px] tracking-[0.3em] uppercase transition-all
            ${isEnding
              ? "border-slate-900 text-slate-700 cursor-not-allowed"
              : "border-emerald-900 text-emerald-800 hover:text-emerald-400 hover:border-emerald-700"
            }
          `}
        >
          {isEnding ? "DEBRIEFING..." : "END SESSION / DEBRIEF"}
        </button>
      </div>
    </div>
  );
}
