export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced';
export type TrainingTimePreference = 'morning' | 'afternoon' | 'evening';
export type WorkoutPhase = 'base' | 'build' | 'peak' | 'taper' | 'recovery' | 'transition';
export type RacePriority = 'A' | 'B' | 'C';
export type WorkoutType = 
  | 'endurance' 
  | 'tempo' 
  | 'intervals' 
  | 'recovery' 
  | 'strength' 
  | 'race_pace' 
  | 'long_run' 
  | 'brick' 
  | 'technique' 
  | 'rest';

export type EquipmentType = 
  | 'bike_trainer' 
  | 'treadmill' 
  | 'heart_rate_monitor' 
  | 'power_meter' 
  | 'gps_watch' 
  | 'pool_access' 
  | 'gym_access' 
  | 'strength_equipment';

export interface TrainingDisruption {
  start_date: string; // ISO date
  end_date: string;   // ISO date
  description: string;
}

export interface TrainingPlanRequest {
  user_id: string;
  race_id: number;
  
  // Training constraints
  days_per_week: number; // 1-7
  max_hours_per_week: number; // 0.1-30
  years_experience: ExperienceLevel;
  
  // Schedule preferences
  preferred_training_days?: string[]; // ['Monday', 'Wednesday', 'Friday']
  preferred_rest_days?: string[]; // ['Sunday']
  preferred_training_time?: TrainingTimePreference;
  
  // Disruptions & limitations
  upcoming_disruptions?: TrainingDisruption[];
  injury_limitations?: string[]; // ['knee pain', 'achilles tendonitis']
  
  // Equipment & facilities
  available_equipment?: EquipmentType[];
  safe_outdoor_routes?: boolean; // Default: true
  
  // Additional preferences
  include_strength_training?: boolean; // Default: true
  include_cross_training?: boolean;     // Default: false
}

export interface DailyWorkout {
  date: string;
  day_of_week: string;
  workout_type: WorkoutType;
  sport: string; // 'cycling', 'running', 'swimming', 'strength'
  duration_minutes: number;
  intensity: string; // RPE or %HRmax
  focus: string;
  description: string;
  
  // Structured workout details
  warmup?: string;
  main_set?: string;
  cooldown?: string;
  
  // Target metrics
  target_tss?: number;
  target_distance_km?: number;
  target_pace_per_km?: string; // "4:30"
  target_power_watts?: number;
  target_heart_rate_zone?: string;
  
  notes?: string;
}

export interface WeeklyPlan {
  week_number: number;
  start_date: string;
  end_date: string;
  phase: WorkoutPhase;
  volume_hours: number;
  intensity_focus: string;
  key_workouts: string[];
  weekly_tss_target?: number;
  notes?: string;
  
  workouts: DailyWorkout[];
}

export interface TrainingPhase {
  phase_name: WorkoutPhase;
  start_date: string;
  end_date: string;
  weeks: number;
  focus: string;
}

export interface TrainingPlan {
  plan_id: string; // UUID
  user_id: string;
  race_id: number;
  created_at: string; // ISO datetime
  
  // Plan metadata
  race_type: string; // From race entry
  race_date: string; // ISO date
  race_priority: RacePriority; // Default: 'A'
  plan_start_date: string; // ISO date
  plan_duration_weeks: number;
  
  // User constraints used
  days_per_week: number;
  max_hours_per_week: number;
  years_experience: ExperienceLevel;
  
  // Plan structure
  phases: TrainingPhase[];
  weekly_plans: WeeklyPlan[];
  
  // Plan statistics
  total_training_hours: number;
  total_tss?: number;
  peak_week_hours: number;
  taper_duration_days: number;
  
  // AI-generated explanations
  plan_rationale: string;
  key_workouts_explanation: string;
  periodization_strategy: string;
  assumptions_made: string[];
  warnings: string[];
}

export interface TrainingPlanResponse {
  success: true;
  plan: TrainingPlan;
  generation_time_seconds: number;
}

export interface TrainingPlanSummary {
  plan_id: string;
  race_id: number;
  race_type: string;
  race_date: string; // ISO date
  created_at: string; // ISO datetime
  plan_duration_weeks: number;
  total_training_hours: number;
  status: 'active' | 'completed'; // Based on race_date
}

export interface TrainingPlansListResponse {
  user_id: string;
  total_plans: number;
  plans: TrainingPlanSummary[];
}

// Form-specific types for validation
export interface TrainingPlanFormData {
  race_id: number;
  days_per_week: number;
  max_hours_per_week: number;
  years_experience: ExperienceLevel;
  preferred_training_days: string[];
  preferred_rest_days: string[];
  preferred_training_time?: TrainingTimePreference;
  upcoming_disruptions: TrainingDisruption[];
  injury_limitations: string[];
  available_equipment: EquipmentType[];
  safe_outdoor_routes: boolean;
  include_strength_training: boolean;
  include_cross_training: boolean;
}

// UI-specific types
export interface TrainingPlanWithCountdown extends TrainingPlan {
  daysUntilRace: number;
  isPast: boolean;
  currentWeek?: number;
}

export const EQUIPMENT_OPTIONS: Record<EquipmentType, string> = {
  bike_trainer: 'Bike Trainer',
  treadmill: 'Treadmill',
  heart_rate_monitor: 'Heart Rate Monitor',
  power_meter: 'Power Meter',
  gps_watch: 'GPS Watch',
  pool_access: 'Pool Access',
  gym_access: 'Gym Access',  
  strength_equipment: 'Strength Equipment'
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export const WORKOUT_TYPE_ICONS: Record<WorkoutType, string> = {
  endurance: '',
  tempo: '',
  intervals: '',
  recovery: '',
  strength: '',
  race_pace: '',
  long_run: '',
  brick: '',
  technique: '',
  rest: ''
};

export const PHASE_COLORS: Record<WorkoutPhase, string> = {
  base: '#10B981', // green
  build: '#F59E0B', // amber
  peak: '#EF4444', // red
  taper: '#8B5CF6', // violet
  recovery: '#06B6D4', // cyan
  transition: '#6B7280' // gray
};