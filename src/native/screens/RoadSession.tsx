import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { C25K_WEEK_1_DAY_1, Interval } from './manifest';

// Assuming RootStackParamList is shared or defined here
import { RootStackParamList } from './FitnessOnboardingGrid';

type RoadSessionRouteProp = RouteProp<RootStackParamList, 'RoadSession'>;

const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  accent: '#3b82f6', // Road color
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  success: '#10b981',
};

export default function RoadSession() {
  const route = useRoute<RoadSessionRouteProp>();
  const navigation = useNavigation();
  const { activityId } = route.params;

  // For now, we'll hardcode the C25K manifest for any interval run.
  // A real implementation would fetch the correct manifest based on activityId.
  const [manifest, setManifest] = useState<Interval[]>([]);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const loadManifest = async () => {
      try {
        let intervals: Interval[] = [];
        
        if (activityId.includes('interval')) {
          intervals = C25K_WEEK_1_DAY_1;
        } else {
          // Steady State manifest
          intervals = [
            { type: 'warmup', durationMinutes: 5 },
            { type: 'work', durationMinutes: 30, intensity: 'medium' },
            { type: 'cooldown', durationMinutes: 5 },
          ];
        }
        
        setManifest(intervals);
        const firstDuration = intervals[0]?.durationMinutes * 60 || 0;
        setTimeRemaining(firstDuration);
        setTotalTime(intervals.reduce((sum, i) => sum + i.durationMinutes * 60, 0));
      } catch (err) {
        console.error('[RoadSession] Failed to load manifest:', err);
        // Fallback to steady state
        const fallback = [
          { type: 'warmup', durationMinutes: 5 },
          { type: 'work', durationMinutes: 30, intensity: 'medium' },
          { type: 'cooldown', durationMinutes: 5 },
        ];
        setManifest(fallback);
      }
    };
    
    loadManifest();
  }, [activityId]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Move to next interval
          if (currentIntervalIndex < manifest.length - 1) {
            const nextIndex = currentIntervalIndex + 1;
            setCurrentIntervalIndex(nextIndex);
            return manifest[nextIndex].durationMinutes * 60;
          } else {
            // Workout finished
            setIsPaused(true);
            Alert.alert('Workout Complete!', 'Great job!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeRemaining, currentIntervalIndex, manifest, navigation]);

  const currentInterval = manifest[currentIntervalIndex];
  if (!currentInterval) {
    return <SafeAreaView style={styles.container}><Text style={styles.text}>Loading workout...</Text></SafeAreaView>;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.activityTitle}>{activityId.replace(/_/g, ' ').toUpperCase()}</Text>
      
      <View style={styles.timerCircle}>
        <Text style={styles.intervalType}>{currentInterval.type.toUpperCase()}</Text>
        <Text style={styles.timeRemaining}>{formatTime(timeRemaining)}</Text>
        <Text style={styles.intervalNotes}>{currentInterval.notes || currentInterval.intensity}</Text>
      </View>

      <TouchableOpacity style={styles.controlButton} onPress={() => setIsPaused(!isPaused)}>
        <Text style={styles.controlButtonText}>{isPaused ? 'START' : 'PAUSE'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.endButton} onPress={() => navigation.goBack()}>
        <Text style={styles.endButtonText}>END SESSION</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  activityTitle: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold', letterSpacing: 2, position: 'absolute', top: 60 },
  timerCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 5,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  intervalType: { color: COLORS.textMuted, fontSize: 18, fontWeight: 'bold', letterSpacing: 2, marginBottom: 10 },
  timeRemaining: { color: COLORS.text, fontSize: 80, fontWeight: 'bold' },
  intervalNotes: { color: COLORS.accent, fontSize: 16, marginTop: 10 },
  controlButton: { backgroundColor: COLORS.accent, paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30, marginBottom: 20 },
  controlButtonText: { color: COLORS.bg, fontSize: 20, fontWeight: 'bold' },
  endButton: { borderColor: COLORS.textMuted, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 40, borderRadius: 20 },
  endButtonText: { color: COLORS.textMuted, fontSize: 16 },
  text: { color: COLORS.text },
});