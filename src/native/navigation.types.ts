import type { ShimmerMode } from '../registry/valkyrie/houses';

export type RootStackParamList = {
  FitnessOnboardingGrid: undefined;
  PushDayOnboarding: { shimmerMode?: ShimmerMode };
  WorkoutSummary: { workoutId: string };
  RoadSession: { activityId: string };
  MatSession: { activityId: string };
  HubSession: undefined;
};