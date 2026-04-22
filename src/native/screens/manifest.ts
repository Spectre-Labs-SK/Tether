export type Domain = 'Iron' | 'Road' | 'Mat' | 'Hub';

export interface Activity {
  id: string;
  name: string;
  domain: Domain;
  description: string;
}

// --- IRON DOMAIN (GYM) ---
export const IRON_ACTIVITIES: Activity[] = [
  { id: 'push', name: 'Push Day', domain: 'Iron', description: 'Chest, Shoulders, Triceps' },
  { id: 'pull', name: 'Pull Day', domain: 'Iron', description: 'Back, Biceps' },
  { id: 'legs', name: 'Leg Day', domain: 'Iron', description: 'Quads, Hamstrings, Calves' },
  { id: 'full_body', name: 'Full Body', domain: 'Iron', description: 'Compound movements' },
];

// --- ROAD DOMAIN (CARDIO) ---
export type RoadActivityType = 'run' | 'cycle';
export type RoadSessionType = 'steady' | 'interval';

export interface RoadActivity extends Activity {
  activityType: RoadActivityType;
  sessionType: RoadSessionType;
}

export const ROAD_ACTIVITIES: RoadActivity[] = [
  { id: 'run_steady', name: 'Steady Run', domain: 'Road', description: 'Consistent pace run', activityType: 'run', sessionType: 'steady' },
  { id: 'run_interval', name: 'Interval Run', domain: 'Road', description: 'Varying intensity run', activityType: 'run', sessionType: 'interval' },
  { id: 'cycle_steady', name: 'Steady Cycle', domain: 'Road', description: 'Consistent pace ride', activityType: 'cycle', sessionType: 'steady' },
  { id: 'cycle_interval', name: 'Interval Cycle', domain: 'Road', description: 'Varying intensity ride', activityType: 'cycle', sessionType: 'interval' },
];

export interface Interval {
  type: 'warmup' | 'work' | 'rest' | 'cooldown';
  durationMinutes: number;
  intensity?: 'low' | 'medium' | 'high';
  notes?: string;
}

export const C25K_WEEK_1_DAY_1: Interval[] = [
  { type: 'warmup', durationMinutes: 5, notes: 'Brisk walk' },
  { type: 'work', durationMinutes: 1, intensity: 'low', notes: 'Jog' },
  { type: 'rest', durationMinutes: 1.5, notes: 'Walk' },
  { type: 'work', durationMinutes: 1, intensity: 'low', notes: 'Jog' },
  { type: 'rest', durationMinutes: 1.5, notes: 'Walk' },
  { type: 'work', durationMinutes: 1, intensity: 'low', notes: 'Jog' },
  { type: 'rest', durationMinutes: 1.5, notes: 'Walk' },
  { type: 'work', durationMinutes: 1, intensity: 'low', notes: 'Jog' },
  { type: 'rest', durationMinutes: 1.5, notes: 'Walk' },
  { type: 'work', durationMinutes: 1, intensity: 'low', notes: 'Jog' },
  { type: 'rest', durationMinutes: 1.5, notes: 'Walk' },
  { type: 'work', durationMinutes: 1, intensity: 'low', notes: 'Jog' },
  { type: 'rest', durationMinutes: 1.5, notes: 'Walk' },
  { type: 'work', durationMinutes: 1, intensity: 'low', notes: 'Jog' },
  { type: 'rest', durationMinutes: 1.5, notes: 'Walk' },
  { type: 'work', durationMinutes: 1, intensity: 'low', notes: 'Jog' },
  { type: 'cooldown', durationMinutes: 5, notes: 'Walk' },
];

// --- MAT DOMAIN (FLEXIBILITY/BODYWEIGHT) ---
export const MAT_ACTIVITIES: Activity[] = [
  { id: 'yoga_flow', name: 'Yoga Flow', domain: 'Mat', description: 'Dynamic vinyasa sequence' },
  { id: 'bodyweight_strength', name: 'Bodyweight Circuit', domain: 'Mat', description: 'Strength-focused calisthenics' },
  { id: 'stretching', name: 'Deep Stretch', domain: 'Mat', description: 'Static and dynamic stretching' },
];

// --- HUB DOMAIN (ACTIVE RECOVERY/DESK) ---
export const HUB_ACTIVITIES: Activity[] = [
  { id: 'desk_session', name: 'Desk Session', domain: 'Hub', description: 'Track movement at your desk' },
];

// --- DOMAIN REGISTRY ---
export const DOMAINS: { name: Domain; activities: Activity[]; icon: string; color: string }[] = [
  { name: 'Iron', activities: IRON_ACTIVITIES, icon: '🏋️', color: '#ef4444' },
  { name: 'Road', activities: ROAD_ACTIVITIES, icon: '🏃‍♂️', color: '#3b82f6' },
  { name: 'Mat', activities: MAT_ACTIVITIES, icon: '🧘', color: '#10b981' },
  { name: 'Hub', activities: HUB_ACTIVITIES, icon: '🖥️', color: '#8b5cf6' },
];