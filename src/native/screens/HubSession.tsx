import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  accent: '#8b5cf6', // Hub color
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  success: '#10b981',
};

export default function HubSession() {
  const navigation = useNavigation();
  const [upTime, setUpTime] = useState(0);
  const [posturalResets, setPosturalResets] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setUpTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const handlePosturalReset = () => {
    setPosturalResets(prev => prev + 1);
    Vibration.vibrate(100); // Simple haptic feedback
  };

  const handleEndSession = () => {
    setIsActive(false);
    // In a real app, we would save the session data here.
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.domainTitle}>HUB SESSION</Text>
      
      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>UP-TIME</Text>
        <Text style={styles.metricValue}>{formatTime(upTime)}</Text>
      </View>

      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>POSTURAL RESETS</Text>
        <Text style={styles.metricValue}>{posturalResets}</Text>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handlePosturalReset}>
        <Text style={styles.buttonText}>POSTURAL RESET</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
        <Text style={styles.endButtonText}>END SESSION</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  domainTitle: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold', letterSpacing: 4, marginBottom: 60 },
  metricContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 8,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '300',
    fontFamily: 'Courier New',
  },
  resetButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  endButton: {
    borderColor: COLORS.textMuted,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  endButtonText: {
    color: COLORS.textMuted,
    fontSize: 16,
    letterSpacing: 2,
  },
});