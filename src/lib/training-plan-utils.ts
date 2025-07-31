import { format, differenceInDays, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { 
  TrainingPlan, 
  TrainingPlanWithCountdown, 
  WeeklyPlan, 
  DailyWorkout,
  WorkoutPhase,
  PHASE_COLORS 
} from '@/types/training-plan';

/**
 * Add countdown and status information to training plans
 */
export function addCountdownToTrainingPlans(plans: TrainingPlan[]): TrainingPlanWithCountdown[] {
  const today = new Date();
  
  return plans.map(plan => {
    const raceDate = parseISO(plan.race_date);
    const daysUntilRace = differenceInDays(raceDate, today);
    const isPast = daysUntilRace < 0;
    
    // Calculate current week if plan is active
    let currentWeek: number | undefined;
    if (!isPast && plan.weekly_plans.length > 0) {
      const planStartDate = parseISO(plan.plan_start_date);
      const weeksSinceStart = Math.floor(differenceInDays(today, planStartDate) / 7);
      if (weeksSinceStart >= 0 && weeksSinceStart < plan.weekly_plans.length) {
        currentWeek = weeksSinceStart + 1;
      }
    }
    
    return {
      ...plan,
      daysUntilRace,
      isPast,
      currentWeek
    };
  });
}

/**
 * Sort training plans by race date (upcoming first, then past)
 */
export function sortTrainingPlansByRaceDate(plans: TrainingPlanWithCountdown[]): TrainingPlanWithCountdown[] {
  return [...plans].sort((a, b) => {
    // If one is past and one is upcoming, prioritize upcoming
    if (a.isPast && !b.isPast) return 1;
    if (!a.isPast && b.isPast) return -1;
    
    // Both upcoming or both past - sort by race date
    const dateA = parseISO(a.race_date);
    const dateB = parseISO(b.race_date);
    
    if (a.isPast && b.isPast) {
      // Past races: most recent first
      return dateB.getTime() - dateA.getTime();
    } else {
      // Upcoming races: earliest first
      return dateA.getTime() - dateB.getTime();
    }
  });
}

/**
 * Get active training plans (not past race date)
 */
export function getActiveTrainingPlans(plans: TrainingPlanWithCountdown[]): TrainingPlanWithCountdown[] {
  return plans.filter(plan => !plan.isPast);
}

/**
 * Format training plan duration in human readable format
 */
export function formatPlanDuration(weeks: number): string {
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  
  const months = Math.floor(weeks / 4);
  const remainingWeeks = weeks % 4;
  
  if (remainingWeeks === 0) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  
  return `${months}m ${remainingWeeks}w`;
}

/**
 * Format workout duration in human readable format
 */
export function formatWorkoutDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format pace string (API already includes units)
 */
export function formatPace(pacePerKm?: string): string {
  if (!pacePerKm) return '';
  return pacePerKm;
}

/**
 * Get the current phase of a training plan
 */
export function getCurrentPhase(plan: TrainingPlanWithCountdown): WorkoutPhase | null {
  if (plan.isPast || !plan.currentWeek) return null;
  
  const currentWeekPlan = plan.weekly_plans.find(week => week.week_number === plan.currentWeek);
  return currentWeekPlan?.phase || null;
}

/**
 * Get phase color for UI styling
 */
export function getPhaseColor(phase: WorkoutPhase): string {
  return PHASE_COLORS[phase];
}

/**
 * Calculate plan progress percentage
 */
export function calculatePlanProgress(plan: TrainingPlanWithCountdown): number {
  if (plan.isPast) return 100;
  if (!plan.currentWeek) return 0;
  
  return Math.min(100, Math.round((plan.currentWeek / plan.plan_duration_weeks) * 100));
}

/**
 * Get workouts for a specific week
 */
export function getWeekWorkouts(plan: TrainingPlan, weekNumber: number): DailyWorkout[] {
  const weekPlan = plan.weekly_plans.find(week => week.week_number === weekNumber);
  return weekPlan?.workouts || [];
}

/**
 * Get week statistics
 */
export function getWeekStats(weekPlan: WeeklyPlan) {
  const totalWorkouts = weekPlan.workouts.filter(w => w.workout_type !== 'rest').length;
  const restDays = weekPlan.workouts.filter(w => w.workout_type === 'rest').length;
  const totalTSS = weekPlan.workouts.reduce((sum, w) => sum + (w.target_tss || 0), 0);
  const totalDistance = weekPlan.workouts.reduce((sum, w) => sum + (w.target_distance_km || 0), 0);
  
  return {
    totalWorkouts,
    restDays,
    totalTSS: totalTSS > 0 ? totalTSS : undefined,
    totalDistance: totalDistance > 0 ? totalDistance : undefined,
    volumeHours: weekPlan.volume_hours
  };
}

/**
 * Group workouts by sport for weekly overview
 */
export function groupWorkoutsBySport(workouts: DailyWorkout[]) {
  const sportGroups = workouts.reduce((groups, workout) => {
    if (workout.workout_type === 'rest') return groups;
    
    if (!groups[workout.sport]) {
      groups[workout.sport] = [];
    }
    groups[workout.sport].push(workout);
    return groups;
  }, {} as Record<string, DailyWorkout[]>);
  
  return Object.entries(sportGroups).map(([sport, workouts]) => ({
    sport,
    count: workouts.length,
    totalMinutes: workouts.reduce((sum, w) => sum + w.duration_minutes, 0),
    totalTSS: workouts.reduce((sum, w) => sum + (w.target_tss || 0), 0)
  }));
}

/**
 * Validate training plan form data
 */
export function validateTrainingPlanForm(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.race_id) {
    errors.push('Please select a race');
  }
  
  if (!data.days_per_week || data.days_per_week < 1 || data.days_per_week > 7) {
    errors.push('Training days per week must be between 1 and 7');
  }
  
  if (!data.max_hours_per_week || data.max_hours_per_week < 0.1 || data.max_hours_per_week > 30) {
    errors.push('Max hours per week must be between 0.1 and 30');
  }
  
  if (!data.years_experience) {
    errors.push('Please select your experience level');
  }
  
  if (data.preferred_training_days && data.preferred_training_days.length > data.days_per_week) {
    errors.push('Cannot have more preferred training days than total training days per week');
  }
  
  if (data.upcoming_disruptions) {
    for (const disruption of data.upcoming_disruptions) {
      if (!disruption.start_date || !disruption.end_date || !disruption.description) {
        errors.push('All disruption fields are required');
        break;
      }
      
      const startDate = parseISO(disruption.start_date);
      const endDate = parseISO(disruption.end_date);
      
      if (endDate <= startDate) {
        errors.push('Disruption end date must be after start date');
        break;
      }
    }
  }
  
  return errors;
}

/**
 * Generate weeks array for week selector
 */
export function generateWeekOptions(plan: TrainingPlan) {
  return Array.from({ length: plan.plan_duration_weeks }, (_, i) => {
    const weekNumber = i + 1;
    const weekPlan = plan.weekly_plans.find(w => w.week_number === weekNumber);
    const startDate = weekPlan ? parseISO(weekPlan.start_date) : addDays(parseISO(plan.plan_start_date), i * 7);
    
    return {
      weekNumber,
      label: `Week ${weekNumber}`,
      dateRange: `${format(startDate, 'MMM d')} - ${format(addDays(startDate, 6), 'MMM d')}`,
      phase: weekPlan?.phase,
      isCurrentWeek: weekNumber === (plan as TrainingPlanWithCountdown).currentWeek
    };
  });
}

/**
 * Get next upcoming workout
 */
export function getNextWorkout(plan: TrainingPlanWithCountdown): DailyWorkout | null {
  if (plan.isPast || !plan.currentWeek) return null;
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Look through remaining weeks starting from current week
  for (let weekNum = plan.currentWeek; weekNum <= plan.plan_duration_weeks; weekNum++) {
    const weekPlan = plan.weekly_plans.find(w => w.week_number === weekNum);
    if (!weekPlan) continue;
    
    const upcomingWorkouts = weekPlan.workouts
      .filter(workout => workout.date >= todayStr && workout.workout_type !== 'rest')
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (upcomingWorkouts.length > 0) {
      return upcomingWorkouts[0];
    }
  }
  
  return null;
}