import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './FitnessOnboardingGrid';

// Define a simple yoga flow manifest locally.
// In a real app, this would come from manifest.ts and be selected via activityId.
interface YogaPose {
  name: string;
  durationSeconds: number;
}

const YOGA_FLOW_MANIFEST: YogaPose[] = [
  { name: 'Cat-Cow', durationSeconds: 60 },
  { name: 'Downward-Facing Dog', durationSeconds: 30 },
  { name: 'Warrior I (Right)', durationSeconds: 30 },
  { name: 'Warrior I (Left)', durationSeconds: 30 },
  { name: 'Warrior II (Right)', durationSeconds: 30 },
  { name: 'Warrior II (Left)', durationSeconds: 30 },
  { name: 'Child\'s Pose', durationSeconds: 60 },
];

type MatSessionRouteProp = RouteProp<RootStackParamList, 'MatSession'>;

const COLORS = {
  bg: '#0f172a',
  accent: '#10b981', // Mat color
  text: '#f1f5f9',
  textMuted: '#94a3b8',
};

export default function MatSession() {
  const route = useRoute<MatSessionRouteProp>();
  const navigation = useNavigation();
  const { activityId } = route.params;

  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    // For now, we only have one flow.
    setPoses(YOGA_FLOW_MANIFEST);
    setTimeRemaining(YOGA_FLOW_MANIFEST[0]?.durationSeconds || 0);
  }, [activityId]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (currentPoseIndex < poses.length - 1) {
            Vibration.vibrate(100); // Haptic for transition
            const nextIndex = currentPoseIndex + 1;
            setCurrentPoseIndex(nextIndex);
            return poses[nextIndex].durationSeconds;
          } else {
            Vibration.vibrate([200, 100, 200]); // Haptic for completion
            setIsPaused(true);
            navigation.goBack();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeRemaining, currentPoseIndex, poses, navigation]);

  const currentPose = poses[currentPoseIndex];

  if (!currentPose) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Loading Session...</Text>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>MAT SESSION</Text>
      <Text style={styles.subtitle}>{activityId.replace(/_/g, ' ').toUpperCase()}</Text>

      <View style={styles.poseContainer}>
        <Text style={styles.poseName}>{currentPose.name}</Text>
        <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
      </View>

      <Text style={styles.progress}>
        Pose {currentPoseIndex + 1} of {poses.length}
      </Text>

      <TouchableOpacity style={styles.controlButton} onPress={() => setIsPaused(!isPaused)}>
        <Text style={styles.controlButtonText}>{isPaused ? 'BEGIN' : 'PAUSE'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'space-around', paddingVertical: 40 },
  title: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold', letterSpacing: 3, marginBottom: 10 },
  subtitle: { color: COLORS.textMuted, fontSize: 16, letterSpacing: 1, marginTop: -20 },
  poseContainer: { alignItems: 'center' },
  poseName: { color: COLORS.text, fontSize: 36, fontWeight: '300', textAlign: 'center', marginBottom: 20 },
  timer: { color: COLORS.accent, fontSize: 72, fontFamily: 'Courier New', fontWeight: 'bold' },
  progress: { color: COLORS.textMuted, fontSize: 14, letterSpacing: 2 },
  controlButton: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 50,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});