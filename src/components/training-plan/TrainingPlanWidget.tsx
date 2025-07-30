import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { 
  addCountdownToTrainingPlans, 
  getActiveTrainingPlans, 
  getNextWorkout, 
  getCurrentPhase, 
  getPhaseColor,
  formatWorkoutDuration 
} from '@/lib/training-plan-utils';
import { format, parseISO } from 'date-fns';

interface TrainingPlanWidgetProps {
  onViewAllPlans: () => void;
}

export function TrainingPlanWidget({ onViewAllPlans }: TrainingPlanWidgetProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const { data: trainingPlans, isLoading } = useQuery({
    queryKey: ['training-plans-widget', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        const response = await apiClient.getUserTrainingPlans(userId, true); // Only active plans
        // Mock full plan data for widget - in real implementation this would be optimized
        const plansWithCountdown = addCountdownToTrainingPlans(response.plans.map(summary => ({
          ...summary,
          user_id: userId,
          phases: [],
          weekly_plans: [],
          years_experience: 'intermediate' as const,
          days_per_week: 0,
          max_hours_per_week: 0,
          total_tss: 0,
          peak_week_hours: 0,
          taper_duration_days: 0,
          plan_rationale: '',
          key_workouts_explanation: '',
          periodization_strategy: '',
          assumptions_made: [],
          warnings: [],
          race_priority: 'A' as const,
          plan_start_date: summary.race_date
        })));
        return getActiveTrainingPlans(plansWithCountdown);
      } catch (err) {
        return [];
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const activePlan = trainingPlans?.[0]; // Get the most recent active plan
  const nextWorkout = activePlan ? getNextWorkout(activePlan) : null;
  const currentPhase = activePlan ? getCurrentPhase(activePlan) : null;

  if (isLoading) {
    return (
      <Card glass className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!trainingPlans || trainingPlans.length === 0) {
    return (
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            🎯 Training Plan
          </h3>
        </div>
        
        <div className="text-center py-4">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-white/70 mb-4 text-sm">
            No active training plans. Create your first AI-powered plan!
          </p>
          <Button
            onClick={() => router.push('/training-plan')}
            variant="primary"
            size="sm"
          >
            Generate Training Plan
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card glass className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            🎯 Training Plan
          </h3>
          <Button
            onClick={onViewAllPlans}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
          >
            View All
          </Button>
        </div>

        {/* Active Plan Info */}
        {activePlan && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">
                  {activePlan.race_type}
                </h4>
                <p className="text-white/60 text-sm">
                  {format(parseISO(activePlan.race_date), 'MMM d, yyyy')}
                </p>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activePlan.daysUntilRace <= 7
                    ? 'bg-red-500/30 text-red-200'
                    : activePlan.daysUntilRace <= 30
                      ? 'bg-yellow-500/30 text-yellow-200'
                      : 'bg-green-500/30 text-green-200'
                }`}>
                  {activePlan.daysUntilRace}d to race
                </div>
              </div>
            </div>

            {/* Current Phase */}
            {currentPhase && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getPhaseColor(currentPhase) }}
                />
                <span className="text-white/80 text-sm capitalize">
                  {currentPhase} Phase
                </span>
                {activePlan.currentWeek && (
                  <span className="text-white/60 text-sm">
                    • Week {activePlan.currentWeek}
                  </span>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {activePlan.currentWeek && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Progress</span>
                  <span>
                    {activePlan.currentWeek}/{activePlan.plan_duration_weeks} weeks
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-tertiary-500 to-tertiary-400 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(activePlan.currentWeek / activePlan.plan_duration_weeks) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Workout */}
        {nextWorkout && (
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-white">
                🔥 Next Workout
              </h5>
              <span className="text-xs text-white/60">
                {format(parseISO(nextWorkout.date), 'MMM d')}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm capitalize">
                  {nextWorkout.sport} - {nextWorkout.workout_type.replace('_', ' ')}
                </span>
                <span className="text-white/60 text-sm">
                  {formatWorkoutDuration(nextWorkout.duration_minutes)}
                </span>
              </div>
              
              <p className="text-white/70 text-xs leading-relaxed">
                {nextWorkout.description}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {activePlan && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => router.push(`/training-plan/${activePlan.plan_id}`)}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              View Plan
            </Button>
            
            {trainingPlans.length === 1 && (
              <Button
                onClick={() => router.push('/training-plan')}
                variant="secondary"
                size="sm"
              >
                + New Plan
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}