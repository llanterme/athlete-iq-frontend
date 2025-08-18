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
      <Card variant="interactive" className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fitness-green-500/20 to-fitness-blue-500/20 rounded-xl"></div>
            <div>
              <div className="h-4 bg-white/10 rounded w-24 mb-1"></div>
              <div className="h-3 bg-white/5 rounded w-20"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="loading-shimmer h-12 rounded-xl"></div>
          <div className="loading-shimmer h-8 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  if (!trainingPlans || trainingPlans.length === 0) {
    return (
      <Card variant="interactive">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fitness-green-500 to-fitness-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Training Plan</h3>
              <p className="text-fitness-navy-400 text-xs">AI-powered periodization</p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-br from-fitness-green-500/10 to-fitness-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-fitness-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-white font-medium text-sm mb-2">No Active Training Plans</p>
          <p className="text-fitness-navy-400 text-xs mb-4">
            Create your first AI-powered plan for structured, goal-focused training!
          </p>
          <Button
            onClick={() => router.push('/training-plan')}
            variant="primary"
            size="md"
            fullWidth
          >
            Generate Training Plan
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="interactive">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fitness-green-500 to-fitness-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Training Plan</h3>
              <p className="text-fitness-navy-400 text-xs">AI-powered periodization</p>
            </div>
          </div>
          <Button
            onClick={onViewAllPlans}
            variant="ghost"
            size="sm"
          >
            View All
          </Button>
        </div>

        {/* Active Plan Info */}
        {activePlan && (
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-white">
                  {activePlan.race_type}
                </h4>
                <p className="text-fitness-navy-300 text-sm font-medium">
                  {format(parseISO(activePlan.race_date), 'MMM d, yyyy')}
                </p>
              </div>
              
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                activePlan.daysUntilRace <= 7
                  ? 'bg-fitness-red-500/10 text-fitness-red-300 border-fitness-red-500/30'
                  : activePlan.daysUntilRace <= 30
                    ? 'bg-fitness-amber-500/10 text-fitness-amber-300 border-fitness-amber-500/30'
                    : 'bg-fitness-green-500/10 text-fitness-green-300 border-fitness-green-500/30'
              }`}>
                {activePlan.daysUntilRace}d to race
              </div>
            </div>

            {/* Current Phase */}
            {currentPhase && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPhaseColor(currentPhase) }}
                  />
                  <span className="text-white font-medium text-sm capitalize">
                    {currentPhase} Phase
                  </span>
                </div>
                {activePlan.currentWeek && (
                  <span className="text-fitness-navy-400 text-sm font-medium">
                    Week {activePlan.currentWeek}
                  </span>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {activePlan.currentWeek && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-fitness-navy-300 font-medium">
                  <span>Training Progress</span>
                  <span>
                    {activePlan.currentWeek}/{activePlan.plan_duration_weeks} weeks
                  </span>
                </div>
                <div className="w-full bg-fitness-navy-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-fitness-green-500 to-fitness-blue-500 h-2 rounded-full transition-all duration-700 shadow-glow-blue/20"
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
          <div className="bg-gradient-to-br from-fitness-orange-500/10 to-fitness-red-500/10 rounded-xl p-4 border border-fitness-orange-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-fitness-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h5 className="text-sm font-semibold text-white">
                  Next Workout
                </h5>
              </div>
              <span className="text-xs text-fitness-orange-300 font-medium">
                {format(parseISO(nextWorkout.date), 'MMM d')}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm capitalize">
                  {nextWorkout.sport} - {nextWorkout.workout_type.replace('_', ' ')}
                </span>
                <span className="text-fitness-orange-300 text-sm font-semibold">
                  {formatWorkoutDuration(nextWorkout.duration_minutes)}
                </span>
              </div>
              
              <p className="text-fitness-navy-200 text-xs leading-relaxed">
                {nextWorkout.description}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {activePlan && (
          <div className="flex gap-3">
            <Button
              onClick={() => router.push(`/training-plan/${activePlan.plan_id}`)}
              variant="primary"
              size="md"
              className="flex-1"
            >
              View Plan
            </Button>
            
            {trainingPlans.length === 1 && (
              <Button
                onClick={() => router.push('/training-plan')}
                variant="secondary"
                size="md"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New Plan
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}