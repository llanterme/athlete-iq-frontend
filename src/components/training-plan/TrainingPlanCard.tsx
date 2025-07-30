import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrainingPlanWithCountdown } from '@/types/training-plan';
import { 
  formatPlanDuration, 
  getCurrentPhase, 
  getPhaseColor, 
  calculatePlanProgress 
} from '@/lib/training-plan-utils';

interface TrainingPlanCardProps {
  plan: TrainingPlanWithCountdown;
  onClick: () => void;
}

export function TrainingPlanCard({ plan, onClick }: TrainingPlanCardProps) {
  const currentPhase = getCurrentPhase(plan);
  const progress = calculatePlanProgress(plan);
  const raceDate = parseISO(plan.race_date);
  
  return (
    <Card glass className="hover:bg-white/15 transition-all duration-200 cursor-pointer group">
      <div onClick={onClick} className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90">
              {plan.race_type}
            </h3>
            <p className="text-white/60 text-sm">
              {format(raceDate, 'MMM d, yyyy')}
            </p>
          </div>
          
          {/* Race countdown badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            plan.isPast 
              ? 'bg-gray-500/30 text-gray-300' 
              : plan.daysUntilRace <= 7
                ? 'bg-red-500/30 text-red-200'
                : plan.daysUntilRace <= 30
                  ? 'bg-yellow-500/30 text-yellow-200'
                  : 'bg-green-500/30 text-green-200'
          }`}>
            {plan.isPast 
              ? 'Completed' 
              : `${plan.daysUntilRace}d left`
            }
          </div>
        </div>

        {/* Progress bar for active plans */}
        {!plan.isPast && plan.currentWeek && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">
                Week {plan.currentWeek} of {plan.plan_duration_weeks}
              </span>
              <span className="text-white/70">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-tertiary-500 to-tertiary-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Current phase indicator */}
        {currentPhase && (
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getPhaseColor(currentPhase) }}
            />
            <span className="text-white/80 text-sm capitalize">
              {currentPhase} Phase
            </span>
          </div>
        )}

        {/* Plan stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {formatPlanDuration(plan.plan_duration_weeks)}
            </div>
            <div className="text-white/60 text-xs">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {Math.round(plan.total_training_hours)}h
            </div>
            <div className="text-white/60 text-xs">Total Volume</div>
          </div>
        </div>

        {/* Action hint */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-white/50 text-xs">
            Click to view details
          </span>
          <div className="text-white/30 group-hover:text-white/50 transition-colors">
            →
          </div>
        </div>
      </div>
    </Card>
  );
}