/**
 * SPECTRE LABS — TETHER MOBILE
 * Screen: Push Day Onboarding
 * Target: Expo SDK / React Native (standalone — not part of the Vite web build)
 * Exercises: Bench Press 3×8-10 | Overhead Press 3×10 | Dips 3×12
 * 1RM: Epley + Brzycki + Lander consensus, synced to one_rm_history via edge function
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { VALKYRIE_MANIFEST } from '../../registry/valkyrie/manifest';

// ---------------------------------------------------------------------------
// 1RM Formula Suite
// ---------------------------------------------------------------------------

/** Epley (1985): 1RM = w × (1 + r/30). Preferred for 1–10 rep range. */
function epley(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/** Brzycki (1993): 1RM = w × 36 / (37 − r). More accurate at 2–10 reps. */
function brzycki(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  if (reps >= 37) return 0; // formula undefined
  return weightKg * (36 / (37 - reps));
}

/** Lander (1985): 1RM = w × 100 / (101.3 − 2.67123 × r). Wider rep range. */
function lander(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return (weightKg * 100) / (101.3 - 2.67123 * reps);
}

/**
 * Consensus 1RM: weighted average of Epley, Brzycki, and Lander.
 * Returns 0 for invalid input rather than throwing.
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0 || reps > 36) return 0;
  const avg = (epley(weightKg, reps) + brzycki(weightKg, reps) + lander(weightKg, reps)) / 3;
  return Math.round(avg * 10) / 10;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  PushDayOnboarding: undefined;
  WorkoutSummary: { workoutId: string };
};

type NavProp = NativeStackNavigationProp<RootStackParamList, 'PushDayOnboarding'>;

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

// ---------------------------------------------------------------------------
// Push Day exercise definitions (IDs resolved from DB on mount)
// ---------------------------------------------------------------------------

const PUSH_DAY_CONFIGS: ExerciseConfig[] = [
  {
    name: 'Barbell Bench Press',
    targetSets: 3,
    minReps: 8,
    maxReps: 10,
    muscleGroup: 'chest',
    movementType: 'push',
    equipmentType: 'barbell',
  },
  {
    name: 'Overhead Press',
    targetSets: 3,
    minReps: 10,
    maxReps: 10,
    muscleGroup: 'shoulders',
    movementType: 'push',
    equipmentType: 'barbell',
  },
  {
    name: 'Dips',
    targetSets: 3,
    minReps: 12,
    maxReps: 12,
    muscleGroup: 'triceps',
    movementType: 'push',
    equipmentType: 'dips-station',
  },
];

function buildEmptySets(targetSets: number): SetEntry[] {
  return Array.from({ length: targetSets }, (_, i) => ({
    setNumber: i + 1,
    reps: '',
    weightKg: '',
    completed: false,
    estimated1RM: null,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PushDayOnboarding() {
  const navigation = useNavigation<NavProp>();

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [originalOrderLogs, setOriginalOrderLogs] = useState<ExerciseLog[]>([]);
  const [isGroupedByEquipment, setIsGroupedByEquipment] = useState(false);
  const [resolving, setResolving] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [workoutStartedAt] = useState<string>(new Date().toISOString());
  const [painAlerts, setPainAlerts] = useState<Record<string, { count: number; lastAlert: number }>>(
    {},
  );

  // Resolve global exercise UUIDs from Supabase so sets reference real FK IDs
  useEffect(() => {
    async function resolveExerciseIds() {
      const names = PUSH_DAY_CONFIGS.map((c) => c.name);

      const { data, error } = await supabase
        .from('exercises')
        .select('id, name')
        .in('name', names)
        .eq('is_global', true);

      if (error || !data) {
        Alert.alert(
          'Connection Error',
          'Could not load exercise catalog. Check your network and try again.',
          [{ text: 'Retry', onPress: resolveExerciseIds }],
        );
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
      setOriginalOrderLogs(resolved);
      setResolving(false);
    }

    resolveExerciseIds();
  }, []);

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, field: 'reps' | 'weightKg', value: string) => {
      setExerciseLogs((prev) => {
        const next = prev.map((log, ei) => {
          if (ei !== exerciseIndex) return log;

          const updatedSets = log.sets.map((s, si) => {
            if (si !== setIndex) return s;

            const updated: SetEntry = { ...s, [field]: value };

            const repsNum = field === 'reps' ? parseFloat(value) : parseFloat(s.reps);
            const weightNum = field === 'weightKg' ? parseFloat(value) : parseFloat(s.weightKg);

            updated.estimated1RM =
              Number.isFinite(repsNum) && Number.isFinite(weightNum) && repsNum > 0 && weightNum > 0
                ? calculate1RM(weightNum, repsNum)
                : null;

            return updated;
          });

          return { ...log, sets: updatedSets };
        });
        return next;
      });
    },
    [],
  );

  const toggleSetComplete = useCallback((exerciseIndex: number, setIndex: number) => {
    setExerciseLogs((prev) =>
      prev.map((log, ei) => {
        if (ei !== exerciseIndex) return log;
        const updatedSets = log.sets.map((s, si) => {
          if (si !== setIndex) return s;

          const repsNum = parseFloat(s.reps);
          const weightNum = parseFloat(s.weightKg);
          const canComplete = Number.isFinite(repsNum) && Number.isFinite(weightNum);

          if (!canComplete && !s.completed) {
            Alert.alert('Missing Data', 'Enter reps and weight before marking a set complete.');
            return s;
          }

          return { ...s, completed: !s.completed };
        });
        return { ...log, sets: updatedSets };
      }),
    );
  }, []);

  const toggleGroupedByEquipment = useCallback(() => {
    setIsGroupedByEquipment((isGrouped) => {
      if (isGrouped) {
        setExerciseLogs(originalOrderLogs);
      } else {
        setExerciseLogs((currentLogs) => {
          const sorted = [...currentLogs].sort((a, b) =>
            a.exercise.equipmentType.localeCompare(b.exercise.equipmentType),
          );
          return sorted;
        });
      }
      return !isGrouped;
    });
  }, [originalOrderLogs]);

  const skipExercise = useCallback((exerciseName: string) => {
    Alert.alert(
      'Skip Exercise',
      `Are you sure you want to skip "${exerciseName}" for this session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            const markAsSkipped = (log: ExerciseLog) =>
              log.exercise.name === exerciseName ? { ...log, skipped: true } : log;

            setExerciseLogs((prev) => prev.map(markAsSkipped));
            setOriginalOrderLogs((prev) => prev.map(markAsSkipped));

            // Sentinel Action: In a real app, this would be persisted and checked.
            console.warn(
              `[Tether] Exercise "${exerciseName}" skipped. This should be tracked across sessions to detect patterns (NoseyQuestionTime() trigger).`,
            );
          },
        },
      ],
    );
  }, []);

  const handlePainAlert = useCallback(
    (muscleGroup: string) => {
      const now = Date.now();
      const fourteenDays = 14 * 24 * 60 * 60 * 1000;

      const currentAlert = painAlerts[muscleGroup];
      let newCount = 1;

      if (currentAlert && now - currentAlert.lastAlert < fourteenDays) {
        newCount = currentAlert.count + 1;
      }

      setPainAlerts((prev) => ({
        ...prev,
        [muscleGroup]: { count: newCount, lastAlert: now },
      }));

      if (newCount === 1) {
        Alert.alert(
          'Pain Logged',
          `A minor pain alert has been logged for the "${muscleGroup}" muscle group. Please be careful. If pain persists, see a professional.`,
        );
      } else if (newCount >= 2) {
        Alert.alert(
          'Muscle Group Lockdown Triggered',
          `You've reported pain for "${muscleGroup}" multiple times recently. To promote recovery, volume and intensity for this muscle group will be reduced for the next 2 weeks.`,
        );
        // The Freeze: In a real app, this would update a global state that the
        // workout generation logic (Manifest-fetcher) would use.
        console.warn(
          `[Tether] Muscle Group Lockdown for "${muscleGroup}" until ${new Date(
            now + fourteenDays,
          ).toLocaleDateString()}.`,
        );
      }
    },
    [painAlerts],
  );

  const activeLogs = exerciseLogs.filter((log) => !log.skipped);

  const allSetsComplete = activeLogs.every((log) => log.sets.every((s) => s.completed));

  const totalCompletedSets = activeLogs.reduce(
    (acc, log) => acc + log.sets.filter((s) => s.completed).length,
    0,
  );

  const totalSets = activeLogs.reduce((acc, log) => acc + log.sets.length, 0);

  async function handleFinishWorkout() {
    if (!allSetsComplete && activeLogs.length > 0) {
      Alert.alert(
        'Incomplete Workout',
        `${totalSets - totalCompletedSets} set(s) not marked complete. Finish anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Finish Anyway', onPress: () => syncWorkout() },
        ],
      );
      return;
    }
    await syncWorkout();
  }

  async function syncWorkout() {
    setSyncing(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Auth Error', 'You must be signed in to save a workout.');
      setSyncing(false);
      return;
    }

    // 1. Create the workout record
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        profile_id: user.id,
        name: 'Push Day',
        shimmer_mode: 'MILITARY',
        started_at: workoutStartedAt,
        finished_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (workoutError || !workout) {
      Alert.alert('Sync Failed', workoutError?.message ?? 'Could not save workout.');
      setSyncing(false);
      return;
    }

    // 2. Build all set rows
    const setRows = exerciseLogs.flatMap((log) =>
      log.sets
        .filter((s) => s.completed)
        .map((s) => ({
          workout_id: workout.id,
          exercise_id: log.exercise.exerciseId,
          set_number: s.setNumber,
          reps: parseFloat(s.reps) || null,
          weight_kg: parseFloat(s.weightKg) || null,
          rpe: null,
          completed: true,
        })),
    );

    // Log skipped exercises as per requirement. In a real app, this would be a DB write.
    const skippedExercises = exerciseLogs
      .filter((log) => log.skipped)
      .map((log) => ({ exercise_id: log.exercise.exerciseId, name: log.exercise.name }));

    if (skippedExercises.length > 0) {
      console.log(
        '[Tether] Logging skipped exercises (placeholder):',
        skippedExercises.map((e) => e.name),
      );
    }

    const { error: setsError } = await supabase.from('workout_sets').insert(setRows);

    if (setsError) {
      Alert.alert('Sync Failed', setsError.message);
      setSyncing(false);
      return;
    }

    // 3. Invoke the sync-workout edge function to handle 1RM upserts
    const { error: fnError } = await supabase.functions.invoke('sync-workout', {
      body: { workoutId: workout.id, profileId: user.id },
    });

    if (fnError) {
      // 1RM sync failure is non-fatal — workout is already saved
      console.warn('[Tether] sync-workout edge function error:', fnError.message);
    }

    setSyncing(false);
    navigation.navigate('WorkoutSummary', { workoutId: workout.id });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (resolving) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Initializing Push Day...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modeTag}>MILITARY MODE</Text>
            <Text style={styles.title}>PUSH DAY</Text>
            <Text style={styles.subtitle}>
              {totalCompletedSets}/{totalSets} sets complete
            </Text>
            <TouchableOpacity onPress={toggleGroupedByEquipment} style={styles.busyGymButton}>
              <Text style={styles.busyGymButtonText}>
                {isGroupedByEquipment ? 'RESTORE ORDER' : 'BUSY GYM OPTIMIZER'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Exercise blocks */}
          {exerciseLogs
            .filter((log) => !log.skipped)
            .map((log, exerciseIndex) => (
            <View key={log.exercise.name} style={styles.exerciseBlock}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{log.exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {log.exercise.targetSets}×
                  {log.exercise.minReps === log.exercise.maxReps
                    ? `${log.exercise.minReps}`
                    : `${log.exercise.minReps}–${log.exercise.maxReps}`}
                </Text>
              </View>

              {/* Set row headers */}
              <View style={styles.setRowHeader}>
                <Text style={[styles.setLabel, styles.setColSet]}>SET</Text>
                <Text style={[styles.setLabel, styles.setColKg]}>KG</Text>
                <Text style={[styles.setLabel, styles.setColReps]}>REPS</Text>
                <Text style={[styles.setLabel, styles.setCol1RM]}>~1RM</Text>
                <Text style={[styles.setLabel, styles.setColDone]}>✓</Text>
              </View>

              {log.sets.map((set, setIndex) => (
                <View
                  key={set.setNumber}
                  style={[styles.setRow, set.completed && styles.setRowComplete]}
                >
                  <Text style={[styles.setNumber, styles.setColSet]}>{set.setNumber}</Text>

                  <TextInput
                    style={[styles.setInput, styles.setColKg]}
                    value={set.weightKg}
                    onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'weightKg', v)}
                    placeholder="0"
                    placeholderTextColor={COLORS.muted}
                    keyboardType="decimal-pad"
                    editable={!set.completed}
                  />

                  <TextInput
                    style={[styles.setInput, styles.setColReps]}
                    value={set.reps}
                    onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'reps', v)}
                    placeholder="0"
                    placeholderTextColor={COLORS.muted}
                    keyboardType="number-pad"
                    editable={!set.completed}
                  />

                  <Text style={[styles.oneRM, styles.setCol1RM]}>
                    {set.estimated1RM !== null ? `${set.estimated1RM}` : '—'}
                  </Text>

                  <TouchableOpacity
                    style={[styles.checkButton, set.completed && styles.checkButtonDone]}
                    onPress={() => toggleSetComplete(exerciseIndex, setIndex)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.checkButtonText}>{set.completed ? '✓' : '○'}</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.painButton]}
                  onPress={() => handlePainAlert(log.exercise.muscleGroup)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: COLORS.danger }]}>LOG PAIN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.skipButton]}
                  onPress={() => skipExercise(log.exercise.name)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: COLORS.warning }]}>SKIP</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Finish button */}
          <TouchableOpacity
            style={[styles.finishButton, syncing && styles.finishButtonDisabled]}
            onPress={handleFinishWorkout}
            disabled={syncing}
            activeOpacity={0.8}
          >
            {syncing ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <Text style={styles.finishButtonText}>FINISH WORKOUT</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Design tokens — MILITARY mode palette
// ---------------------------------------------------------------------------

const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  accent: '#64748b',
  text: '#f1f5f9',
  muted: '#475569',
  complete: '#22c55e',
  completeBg: '#14532d',
  warning: '#f9a825',
  danger: '#ef4444',
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.muted,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
    letterSpacing: 2,
  },

  header: { marginBottom: 32 },
  modeTag: {
    color: COLORS.accent,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 6,
  },
  busyGymButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
  },
  busyGymButtonText: {
    color: COLORS.accent,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    letterSpacing: 2,
  },

  exerciseBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    flex: 1,
  },
  exerciseMeta: {
    color: COLORS.accent,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    letterSpacing: 1,
  },

  setRowHeader: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  setLabel: {
    color: COLORS.muted,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },

  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  setRowComplete: {
    backgroundColor: COLORS.completeBg,
    borderRadius: 4,
    borderTopColor: 'transparent',
    marginTop: 1,
  },

  setColSet: { width: 32, textAlign: 'center' },
  setColKg: { flex: 1, textAlign: 'center' },
  setColReps: { flex: 1, textAlign: 'center' },
  setCol1RM: { flex: 1, textAlign: 'center' },
  setColDone: { width: 40, textAlign: 'center' },

  setNumber: {
    color: COLORS.muted,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
  },
  setInput: {
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginHorizontal: 4,
  },
  oneRM: {
    color: COLORS.accent,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },

  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  checkButtonDone: {
    borderColor: COLORS.complete,
    backgroundColor: COLORS.complete,
  },
  checkButtonText: {
    color: COLORS.text,
    fontSize: 14,
  },

  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  actionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  skipButton: {
    borderColor: COLORS.warning,
  },
  painButton: {
    borderColor: COLORS.danger,
  },

  finishButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonText: {
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },
});
