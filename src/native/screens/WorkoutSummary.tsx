import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './FitnessOnboardingGrid';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutSummary'>;
type WorkoutSummaryRouteProp = RouteProp<RootStackParamList, 'WorkoutSummary'>;

const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  accent: '#4ade80',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#334155',
};

export default function WorkoutSummary() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<WorkoutSummaryRouteProp>();
  const { workoutId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>SPECTRE LABS / TETHER</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>SESSION{'\n'}COMPLETE</Text>
        <View style={styles.divider} />
        <Text style={styles.idLabel}>WORKOUT ID</Text>
        <Text style={styles.idValue}>{workoutId}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>RETURN TO BASE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 4,
    fontFamily: 'Courier New',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.accent,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
    fontFamily: 'Courier New',
    lineHeight: 56,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 32,
  },
  idLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: 'Courier New',
    marginBottom: 8,
  },
  idValue: {
    color: COLORS.text,
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: 'Courier New',
  },
  button: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: 'Courier New',
  },
});
