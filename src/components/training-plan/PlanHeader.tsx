import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { TrainingPlanWithCountdown } from '@/types/training-plan';
import { 
  formatPlanDuration, 
  getCurrentPhase, 
  getPhaseColor, 
  calculatePlanProgress 
} from '@/lib/training-plan-utils';

interface PlanHeaderProps {
  plan: TrainingPlanWithCountdown;
}

export function PlanHeader({ plan }: PlanHeaderProps) {
  const currentPhase = getCurrentPhase(plan);
  const progress = calculatePlanProgress(plan);
  const raceDate = parseISO(plan.race_date);
  
  return (
    <Card variant="default" className="p-6">
      <div className="space-y-6">
        {/* Title and Race Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {plan.race_type} Training Plan
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏁</span>
                <span>{format(raceDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <span>Created {format(parseISO(plan.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          
          {/* Race Countdown */}
          <div className="text-center sm:text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              plan.isPast 
                ? 'bg-gray-500/30 text-gray-300' 
                : plan.daysUntilRace <= 7
                  ? 'bg-red-500/30 text-red-200'
                  : plan.daysUntilRace <= 30
                    ? 'bg-yellow-500/30 text-yellow-200'
                    : 'bg-green-500/30 text-green-200'
            }`}>
              {plan.isPast 
                ? '🏆 Race Completed' 
                : `⏰ ${plan.daysUntilRace} days to race`
              }
            </div>
            {!plan.isPast && plan.daysUntilRace <= 14 && (
              <p className="text-orange-300 text-xs mt-1">
                Taper phase - focus on recovery!
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar for Active Plans */}
        {!plan.isPast && plan.currentWeek && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-white">
                <span className="font-medium">Week {plan.currentWeek} of {plan.plan_duration_weeks}</span>
                {currentPhase && (
                  <span className="ml-3 px-2 py-1 rounded-full text-xs font-medium text-white/90" 
                        style={{ backgroundColor: getPhaseColor(currentPhase) + '40', color: getPhaseColor(currentPhase) }}>
                    {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
                  </span>
                )}
              </div>
              <div className="text-white/70 text-sm">
                {progress}% Complete
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-tertiary-500 to-tertiary-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Plan Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {formatPlanDuration(plan.plan_duration_weeks)}
            </div>
            <div className="text-white/60 text-sm">Duration</div>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {Math.round(plan.total_training_hours)}h
            </div>
            <div className="text-white/60 text-sm">Total Volume</div>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {plan.days_per_week}
            </div>
            <div className="text-white/60 text-sm">Days/Week</div>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {Math.round(plan.peak_week_hours)}h
            </div>
            <div className="text-white/60 text-sm">Peak Week</div>
          </div>
        </div>

        {/* Experience Level & Plan Details */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/70">
            <span className="text-sm">📊 {plan.years_experience.charAt(0).toUpperCase() + plan.years_experience.slice(1)} Level</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <span className="text-sm">⏰ {plan.max_hours_per_week}h/week max</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <span className="text-sm">🎯 Priority {plan.race_priority} Race</span>
          </div>
          {plan.total_tss && (
            <div className="flex items-center gap-2 text-white/70">
              <span className="text-sm">📈 {Math.round(plan.total_tss)} Total TSS</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}