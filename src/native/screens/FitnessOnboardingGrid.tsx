import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DOMAINS, Domain, Activity } from '../../core/manifest';
import type { ShimmerMode } from '../../registry/valkyrie/houses';

// Assuming a root stack navigator setup
export type RootStackParamList = {
  FitnessOnboardingGrid: undefined;
  PushDayOnboarding: { shimmerMode?: ShimmerMode };
  RoadSession: { activityId: string };
  MatSession: { activityId: string };
  HubSession: undefined;
  WorkoutSummary: { workoutId: string }; // From previous context
};

type NavProp = NativeStackNavigationProp<RootStackParamList, 'FitnessOnboardingGrid'>;

const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  accent: '#64748b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
};

export default function FitnessOnboardingGrid() {
  const navigation = useNavigation<NavProp>();
  const [step, setStep] = useState<'domain' | 'activity'>('domain');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  const handleDomainSelect = (domain: (typeof DOMAINS)[0]) => {
    setSelectedDomain(domain.name);
    if (domain.name === 'Hub') {
      // 'Hub' is a 2-tap flow: Tap Domain -> Start Session
      navigation.navigate('HubSession');
      // Reset state for next time
      setTimeout(() => {
        setSelectedDomain(null);
        setStep('domain');
      }, 500);
    } else {
      setStep('activity');
    }
  };

  const handleActivitySelect = (activity: Activity) => {
    // This is the final selection before starting
    switch (activity.domain) {
      case 'Iron':
        if (activity.id === 'push') {
          navigation.navigate('PushDayOnboarding', { shimmerMode: 'MILITARY' });
        } else {
          Alert.alert('Coming Soon', `${activity.name} workouts are under construction.`);
        }
        break;
      case 'Road':
        navigation.navigate('RoadSession', { activityId: activity.id });
        break;
      case 'Mat':
        navigation.navigate('MatSession', { activityId: activity.id });
        break;
      default:
        Alert.alert('Error', 'Unknown activity domain.');
    }
    // Reset state for next time
    setTimeout(() => {
      setSelectedDomain(null);
      setStep('domain');
    }, 500);
  };

  const renderDomainGrid = () => (
    <View>
      <Text style={styles.title}>Select Your Domain</Text>
      <Text style={styles.subtitle}>What kind of activity are you starting?</Text>
      <View style={styles.grid}>
        {DOMAINS.map((domain) => (
          <TouchableOpacity
            key={domain.name}
            style={[styles.gridButton, { borderColor: domain.color }]}
            onPress={() => handleDomainSelect(domain)}
          >
            <Text style={styles.gridIcon}>{domain.icon}</Text>
            <Text style={styles.gridLabel}>{domain.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActivityList = () => {
    const domainData = DOMAINS.find(d => d.name === selectedDomain);
    if (!domainData) return null;

    return (
      <View>
        <TouchableOpacity onPress={() => setStep('domain')} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back to Domains</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{domainData.name}</Text>
        <Text style={styles.subtitle}>Choose your focus for today.</Text>
        <View style={styles.list}>
          {domainData.activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.listItem}
              onPress={() => handleActivitySelect(activity)}
            >
              <Text style={styles.listItemTitle}>{activity.name}</Text>
              <Text style={styles.listItemDescription}>{activity.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {step === 'domain' ? renderDomainGrid() : renderActivityList()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: {
    color: COLORS.text,
    fontFamily: 'Courier New',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: 'Courier New',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '4%',
  },
  gridIcon: {
    fontSize: 48,
  },
  gridLabel: {
    color: COLORS.text,
    fontFamily: 'Courier New',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  backButton: {
    position: 'absolute',
    top: -20,
    left: 0,
  },
  backButtonText: {
    color: COLORS.accent,
    fontFamily: 'Courier New',
    fontSize: 14,
  },
  list: {
    marginTop: 20,
  },
  listItem: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listItemTitle: {
    color: COLORS.text,
    fontFamily: 'Courier New',
    fontSize: 18,
    fontWeight: '600',
  },
  listItemDescription: {
    color: COLORS.textMuted,
    fontFamily: 'Courier New',
    fontSize: 14,
    marginTop: 4,
  },
});