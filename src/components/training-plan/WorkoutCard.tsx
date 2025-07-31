import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WorkoutDetails } from './WorkoutDetails';
import { DailyWorkout, WORKOUT_TYPE_ICONS } from '@/types/training-plan';
import { formatWorkoutDuration, formatPace } from '@/lib/training-plan-utils';

interface WorkoutCardProps {
  workout: DailyWorkout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const workoutDate = parseISO(workout.date);
  const isRestDay = workout.workout_type === 'rest';
  
  const handleToggle = () => {
    if (!isRestDay) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card 
      glass 
      className={`transition-all duration-200 ${
        isRestDay 
          ? 'opacity-75' 
          : 'hover:bg-white/15 cursor-pointer'
      }`}
      onClick={handleToggle}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {WORKOUT_TYPE_ICONS[workout.workout_type] || '🏃‍♂️'}
            </div>
            <div>
              <h4 className="font-semibold text-white capitalize">
                {workout.day_of_week}
              </h4>
              <p className="text-white/70 text-sm">
                {format(workoutDate, 'MMM d')}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            {!isRestDay && (
              <div className="text-white font-medium">
                {formatWorkoutDuration(workout.duration_minutes)}
              </div>
            )}
            <div className={`text-xs px-2 py-1 rounded-full capitalize ${
              isRestDay 
                ? 'bg-gray-500/30 text-gray-300'
                : 'bg-tertiary-500/30 text-tertiary-200'
            }`}>
              {workout.workout_type.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Workout Summary */}
        {!isRestDay && (
          <div className="space-y-3">
            {/* Sport and Focus */}
            <div className="flex items-center justify-between">
              <span className="text-white/80 capitalize font-medium">
                {workout.sport}
              </span>
              <span className="text-white/60 text-sm">
                {workout.focus}
              </span>
            </div>

            {/* Description */}
            <p className="text-white/70 text-sm leading-relaxed">
              {workout.description}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              {workout.intensity && (
                <div className="flex items-center gap-1">
                  <span className="text-white/50">Intensity:</span>
                  <span className="text-white/80">{workout.intensity}</span>
                </div>
              )}
              
              {workout.target_distance_km && (
                <div className="flex items-center gap-1">
                  <span className="text-white/50">Distance:</span>
                  <span className="text-white/80">{workout.target_distance_km}km</span>
                </div>
              )}
              
              {workout.target_pace_per_km && (
                <div className="flex items-center gap-1">
                  <span className="text-white/50">Pace:</span>
                  <span className="text-white/80">{formatPace(workout.target_pace_per_km)}</span>
                </div>
              )}
              
              {workout.target_tss && (
                <div className="flex items-center gap-1">
                  <span className="text-white/50">TSS:</span>
                  <span className="text-white/80">{workout.target_tss}</span>
                </div>
              )}
            </div>

            {/* Expand/Collapse Indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-white/50 text-xs">
                {isExpanded ? 'Click to collapse' : 'Click for detailed workout'}
              </span>
              <div className={`text-white/50 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}>
                ↓
              </div>
            </div>
          </div>
        )}

        {/* Rest Day Message */}
        {isRestDay && (
          <div className="text-center py-4">
            <p className="text-white/70 text-sm">
              Rest and recovery day - take it easy and let your body adapt to training.
            </p>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && !isRestDay && (
        <div className="border-t border-white/10">
          <WorkoutDetails workout={workout} />
        </div>
      )}
    </Card>
  );
}