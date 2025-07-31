import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { WorkoutCard } from './WorkoutCard';
import { TrainingPlan } from '@/types/training-plan';
import { getWeekWorkouts, getWeekStats, groupWorkoutsBySport } from '@/lib/training-plan-utils';

interface WeeklyViewProps {
  plan: TrainingPlan;
  selectedWeek: number;
}

export function WeeklyView({ plan, selectedWeek }: WeeklyViewProps) {
  const weekPlan = plan.weekly_plans.find(week => week.week_number === selectedWeek);
  const workouts = getWeekWorkouts(plan, selectedWeek);
  
  if (!weekPlan) {
    return (
      <Card glass className="p-8 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Week Not Found
        </h3>
        <p className="text-white/70">
          Week {selectedWeek} data is not available for this training plan.
        </p>
      </Card>
    );
  }

  const weekStats = getWeekStats(weekPlan);
  const sportGroups = groupWorkoutsBySport(workouts);

  return (
    <div className="space-y-6">
      {/* Week Overview */}
      <Card glass className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">
                Week {selectedWeek} Overview
              </h3>
              <p className="text-white/70">
                {format(parseISO(weekPlan.start_date), 'MMM d')} - {format(parseISO(weekPlan.end_date), 'MMM d, yyyy')}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {weekStats.volumeHours}h
              </div>
              <div className="text-white/60 text-sm">Total Volume</div>
            </div>
          </div>

          {/* Week Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {weekStats.totalWorkouts}
              </div>
              <div className="text-white/60 text-sm">Workouts</div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {weekStats.restDays}
              </div>
              <div className="text-white/60 text-sm">Rest Days</div>
            </div>
            
            {weekStats.totalTSS && (
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-lg font-semibold text-white">
                  {Math.round(weekStats.totalTSS)}
                </div>
                <div className="text-white/60 text-xs">TSS</div>
              </div>
            )}
            
            {weekStats.totalDistance && (
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-lg font-semibold text-white">
                  {Math.round(weekStats.totalDistance)}km
                </div>
                <div className="text-white/60 text-xs">Distance</div>
              </div>
            )}
          </div>

          {/* Week Focus & Notes */}
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">
                Focus This Week
              </h4>
              <p className="text-white/80 text-sm">
                {weekPlan.intensity_focus}
              </p>
            </div>
            
            {weekPlan.key_workouts.length > 0 && (
              <div className="p-3 bg-white/5 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">
                  Key Workouts
                </h4>
                <ul className="text-white/80 text-sm space-y-1">
                  {weekPlan.key_workouts.map((workout, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-white/50">•</span>
                      <span>{workout}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {weekPlan.notes && (
              <div className="p-3 bg-white/5 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">
                  Notes
                </h4>
                <p className="text-white/80 text-sm">
                  {weekPlan.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sport Breakdown */}
          {sportGroups.length > 1 && (
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">
                Training Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {sportGroups.map((group) => (
                  <div key={group.sport} className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-lg font-semibold text-white capitalize mb-1">
                      {group.sport}
                    </div>
                    <div className="text-white/70 text-sm">
                      {group.count} sessions • {Math.round(group.totalMinutes / 60)}h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Daily Workouts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Daily Workouts
        </h3>
        
        {workouts.length > 0 ? (
          <div className="grid gap-4">
            {workouts.map((workout, index) => (
              <WorkoutCard key={index} workout={workout} />
            ))}
          </div>
        ) : (
          <Card glass className="p-8 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              No Workouts Scheduled
            </h3>
            <p className="text-white/70">
              This week appears to be a rest or recovery week.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}