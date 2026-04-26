import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { agentLog } from '../../lib/agentLog';

// ---------------------------------------------------------------------------
// 1RM Formula Suite
// ---------------------------------------------------------------------------
function epley(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

function brzycki(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  if (reps >= 37) return 0;
  return weightKg * (36 / (37 - reps));
}

function lander(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return (weightKg * 100) / (101.3 - 2.67123 * reps);
}

export function calculate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0 || reps > 36) return 0;
  const avg = (epley(weightKg, reps) + brzycki(weightKg, reps) + lander(weightKg, reps)) / 3;
  return Math.round(avg * 10) / 10;
}

// ---------------------------------------------------------------------------
// Types & Configs
// ---------------------------------------------------------------------------
interface ExerciseConfig {
  name: string;
  targetSets: number;
  minReps: number;
  maxReps: number;
  muscleGroup: string;
  movementType: 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'accessory';
  equipmentType: 'barbell' | 'dumbbell' | 'machine' | 'dips-station' | 'bodyweight';
}

interface ResolvedExercise extends ExerciseConfig {
  exerciseId: string;
}

interface SetEntry {
  setNumber: number;
  reps: string;
  weightKg: string;
  completed: boolean;
  estimated1RM: number | null;
}

interface ExerciseLog {
  exercise: ResolvedExercise;
  sets: SetEntry[];
  skipped: boolean;
}

const PUSH_DAY_CONFIGS: ExerciseConfig[] = [
  { name: 'Barbell Bench Press', targetSets: 3, minReps: 8, maxReps: 10, muscleGroup: 'chest', movementType: 'push', equipmentType: 'barbell' },
  { name: 'Overhead Press', targetSets: 3, minReps: 10, maxReps: 10, muscleGroup: 'shoulders', movementType: 'push', equipmentType: 'barbell' },
  { name: 'Dips', targetSets: 3, minReps: 12, maxReps: 12, muscleGroup: 'triceps', movementType: 'push', equipmentType: 'dips-station' },
];

function buildEmptySets(targetSets: number): SetEntry[] {
  return Array.from({ length: targetSets }, (_, i) => ({
    setNumber: i + 1, reps: '', weightKg: '', completed: false, estimated1RM: null,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
type Props = {
  hardStop?: string;
  compressionStatus?: string | null;
  sessionSeconds: number;
  formatTime: (s: number) => string;
  onComplete: () => Promise<void>;
};

export default function PushDaySession({ hardStop, compressionStatus, sessionSeconds, formatTime, onComplete }: Props) {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [resolving, setResolving] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [workoutStartedAt] = useState<string>(new Date().toISOString());
  const [painAlerts, setPainAlerts] = useState<Record<string, { count: number; lastAlert: number }>>({});

  useEffect(() => {
    async function resolveExerciseIds() {
      const names = PUSH_DAY_CONFIGS.map((c) => c.name);
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name')
        .in('name', names)
        .eq('is_global', true);

      if (error || !data) {
        agentLog.architect("Failed to resolve exercise IDs from Supabase.");
        return;
      }

      const idMap = new Map<string, string>(data.map((row) => [row.name, row.id]));
      const resolved: ExerciseLog[] = PUSH_DAY_CONFIGS.map((config) => {
        const exerciseId = idMap.get(config.name) ?? '';
        return {
          exercise: { ...config, exerciseId },
          sets: buildEmptySets(config.targetSets),
          skipped: false,
        };
      });

      setExerciseLogs(resolved);
      setResolving(false);
    }
    resolveExerciseIds();
  }, []);

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, field: 'reps' | 'weightKg', value: string) => {
    setExerciseLogs((prev) => prev.map((log, ei) => {
      if (ei !== exerciseIndex) return log;
      const updatedSets = log.sets.map((s, si) => {
        if (si !== setIndex) return s;
        const updated: SetEntry = { ...s, [field]: value };
        const repsNum = field === 'reps' ? parseFloat(value) : parseFloat(s.reps);
        const weightNum = field === 'weightKg' ? parseFloat(value) : parseFloat(s.weightKg);
        updated.estimated1RM = (Number.isFinite(repsNum) && Number.isFinite(weightNum) && repsNum > 0 && weightNum > 0)
          ? calculate1RM(weightNum, repsNum) : null;
        return updated;
      });
      return { ...log, sets: updatedSets };
    }));
  }, []);

  const toggleSetComplete = useCallback((exerciseIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => prev.map((log, ei) => {
      if (ei !== exerciseIndex) return log;
      const updatedSets = log.sets.map((s, si) => {
        if (si !== setIndex) return s;
        const repsNum = parseFloat(s.reps);
        const weightNum = parseFloat(s.weightKg);
        if (!(Number.isFinite(repsNum) && Number.isFinite(weightNum)) && !s.completed) {
          alert('Enter reps and weight before marking complete.');
          return s;
        }
        return { ...s, completed: !s.completed };
      });
      return { ...log, sets: updatedSets };
    }));
  }, []);

  const skipExercise = useCallback((exerciseName: string) => {
    if (!window.confirm(`Skip "${exerciseName}" for this session?`)) return;
    setExerciseLogs((prev) => prev.map(log => log.exercise.name === exerciseName ? { ...log, skipped: true } : log));
    // Persist skip
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('exercise_skips').insert({
          profile_id: user.id, exercise_name: exerciseName, skipped_at: new Date().toISOString(),
        }).then();
      }
    });
  }, []);

  const handlePainAlert = useCallback(async (muscleGroup: string) => {
    const now = Date.now();
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;
    const currentAlert = painAlerts[muscleGroup];
    let newCount = 1;

    if (currentAlert && now - currentAlert.lastAlert < fourteenDays) {
      newCount = currentAlert.count + 1;
    }

    setPainAlerts(prev => ({ ...prev, [muscleGroup]: { count: newCount, lastAlert: now } }));

    if (newCount === 1) {
      alert(`Pain logged for "${muscleGroup}". Be careful.`);
    } else if (newCount >= 2) {
      alert(`Muscle Group Lockdown: Volume for "${muscleGroup}" reduced for 2 weeks.`);
      const lockdownUntil = new Date(now + fourteenDays);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        supabase.from('muscle_group_freezes').insert({
          profile_id: user.id, muscle_group: muscleGroup,
          locked_until: lockdownUntil.toISOString(), created_at: new Date(now).toISOString(),
        }).then();
      }
    }
  }, [painAlerts]);

  const activeLogs = exerciseLogs.filter(log => !log.skipped);
  const totalCompletedSets = activeLogs.reduce((acc, log) => acc + log.sets.filter(s => s.completed).length, 0);
  const totalSets = activeLogs.reduce((acc, log) => acc + log.sets.length, 0);
  const allSetsComplete = totalSets > 0 && totalCompletedSets === totalSets;

  const handleFinishWorkout = async () => {
    if (!allSetsComplete && activeLogs.length > 0) {
      if (!window.confirm(`${totalSets - totalCompletedSets} sets incomplete. Finish anyway?`)) return;
    }
    setSyncing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Must be signed in to save.');
      setSyncing(false);
      return;
    }

    // 1. Create Workout
    const { data: workout, error: workoutError } = await supabase.from('workouts').insert({
      profile_id: user.id, name: 'Push Day', shimmer_mode: 'MILITARY', // Or get from context
      started_at: workoutStartedAt, finished_at: new Date().toISOString(),
    }).select('id').single();

    if (workoutError || !workout) {
      alert('Sync failed: ' + workoutError?.message);
      setSyncing(false);
      return;
    }

    // 2. Set Rows
    const setRows = exerciseLogs.flatMap(log => log.sets.filter(s => s.completed).map(s => ({
      workout_id: workout.id, exercise_id: log.exercise.exerciseId, set_number: s.setNumber,
      reps: parseFloat(s.reps), weight_kg: parseFloat(s.weightKg), completed: true,
    })));

    if (setRows.length > 0) {
      await supabase.from('workout_sets').insert(setRows);
    }

    // 3. Invoke sync-workout edge function for 1RM
    await supabase.functions.invoke('sync-workout', { body: { workoutId: workout.id, profileId: user.id } });

    agentLog.valkyrie(`Push Day logged. ${totalCompletedSets} sets synced to mainframe.`);
    setSyncing(false);
    await onComplete();
  };

  if (resolving) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 font-mono text-emerald-500 text-[10px] tracking-widest uppercase animate-pulse">
        Initializing Push Day Protocol...
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-8 font-mono overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.4em] uppercase text-slate-600 mb-2">TETHER // IRON_DOMAIN</p>
        <h1 className="text-3xl font-black uppercase tracking-widest text-white">Push Day</h1>
        <div className="flex justify-between items-end mt-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-4xl font-black tabular-nums text-emerald-400 tracking-tighter">
              {formatTime(sessionSeconds)}
            </div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-slate-500">Time on Target</p>
          </div>
          <p className="text-xs text-slate-400">{totalCompletedSets}/{totalSets} SETS DONE</p>
        </div>
      </div>

      {hardStop && (
        <div className="border border-emerald-950 px-6 py-3 mb-6 bg-[#0f172a]">
          <p className="text-[9px] tracking-[0.3em] uppercase text-emerald-600">EXTRACTION: {hardStop}</p>
          {compressionStatus && (
            <p className={`text-[9px] tracking-[0.2em] mt-1 font-black ${compressionStatus.includes("CRITICAL") || compressionStatus.includes("TERMINATE") ? "text-red-500 animate-pulse" : "text-yellow-500"}`}>
              &gt; {compressionStatus}
            </p>
          )}
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-6 flex-1">
        {exerciseLogs.filter(log => !log.skipped).map((log, ei) => (
          <div key={log.exercise.name} className="border border-slate-800 bg-[#0a0a0b] p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-500">{log.exercise.name}</h2>
              <span className="text-[10px] text-slate-500">{log.exercise.targetSets}×{log.exercise.minReps === log.exercise.maxReps ? log.exercise.minReps : `${log.exercise.minReps}-${log.exercise.maxReps}`}</span>
            </div>

            <div className="grid grid-cols-[30px_1fr_1fr_1fr_40px] gap-2 mb-2 text-[9px] tracking-widest text-slate-600 text-center border-b border-slate-800 pb-2">
              <div>SET</div><div>KG</div><div>REPS</div><div>~1RM</div><div>✓</div>
            </div>

            {log.sets.map((set, si) => (
              <div key={set.setNumber} className={`grid grid-cols-[30px_1fr_1fr_1fr_40px] gap-2 items-center py-2 text-sm ${set.completed ? 'opacity-50' : ''}`}>
                <div className="text-center text-slate-500 text-xs">{set.setNumber}</div>
                <input
                  type="number" value={set.weightKg} onChange={(e) => updateSet(ei, si, 'weightKg', e.target.value)} disabled={set.completed}
                  className="bg-transparent border-b border-slate-700 text-center text-white focus:outline-none focus:border-emerald-500" placeholder="0"
                />
                <input
                  type="number" value={set.reps} onChange={(e) => updateSet(ei, si, 'reps', e.target.value)} disabled={set.completed}
                  className="bg-transparent border-b border-slate-700 text-center text-white focus:outline-none focus:border-emerald-500" placeholder="0"
                />
                <div className="text-center text-emerald-700">{set.estimated1RM || '—'}</div>
                <button
                  onClick={() => toggleSetComplete(ei, si)}
                  className={`w-6 h-6 mx-auto rounded-full border flex items-center justify-center text-xs ${set.completed ? 'border-emerald-500 bg-emerald-900 text-emerald-400' : 'border-slate-600 text-slate-600'}`}
                >
                  {set.completed ? '✓' : ''}
                </button>
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-800/50">
              <button onClick={() => handlePainAlert(log.exercise.muscleGroup)} className="text-[9px] tracking-widest text-red-600/70 hover:text-red-500">LOG PAIN</button>
              <button onClick={() => skipExercise(log.exercise.name)} className="text-[9px] tracking-widest text-yellow-600/70 hover:text-yellow-500">SKIP</button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleFinishWorkout} disabled={syncing}
        className={`mt-8 w-full border py-5 text-[10px] tracking-[0.3em] uppercase transition-all ${syncing ? 'border-slate-800 text-slate-700' : 'bg-emerald-600 border-emerald-600 text-black hover:bg-emerald-500 font-black'}`}
      >
        {syncing ? 'SYNCING TO MAINFRAME...' : 'END SESSION / DEBRIEF'}
      </button>
    </div>
  );
}
