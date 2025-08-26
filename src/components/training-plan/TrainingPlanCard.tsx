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
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function TrainingPlanCard({ plan, onClick, onDelete, isDeleting }: TrainingPlanCardProps) {
  const currentPhase = getCurrentPhase(plan);
  const progress = calculatePlanProgress(plan);
  const raceDate = parseISO(plan.race_date);
  
  return (
    <Card variant="interactive" className="hover:bg-white/15 transition-all duration-200 cursor-pointer group">
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-white/50 text-xs">
            Click to view details
          </span>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  onDelete();
                }}
                disabled={isDeleting}
                className="text-red-300 hover:text-red-200 transition-colors p-1 rounded hover:bg-red-500/20 disabled:opacity-50"
                title="Delete training plan"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 animate-spin rounded-full border border-red-300 border-t-transparent"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
            <div className="text-white/30 group-hover:text-white/50 transition-colors">
              →
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}