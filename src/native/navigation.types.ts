import type { ShimmerMode } from '../registry/valkyrie/houses';

export type RootStackParamList = {
  Level0BunkerReconstruction: undefined;
  FitnessOnboardingGrid: undefined;
  PushDayOnboarding: { shimmerMode?: ShimmerMode };
  WorkoutSummary: { workoutId: string };
  RoadSession: { activityId: string };
  MatSession: { activityId: string };
  HubSession: undefined;
};
