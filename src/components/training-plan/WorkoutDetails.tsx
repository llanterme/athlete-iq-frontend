import { DailyWorkout } from '@/types/training-plan';
import { formatPace } from '@/lib/training-plan-utils';

interface WorkoutDetailsProps {
  workout: DailyWorkout;
}

export function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const hasStructuredWorkout = workout.warmup || workout.main_set || workout.cooldown;
  
  return (
    <div className="p-4 space-y-4">
      {/* Target Metrics */}
      {(workout.target_distance_km || workout.target_pace_per_km || workout.target_power_watts || workout.target_heart_rate_zone || workout.target_tss) && (
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">🎯 Target Metrics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {workout.target_distance_km && (
              <div className="flex justify-between">
                <span className="text-white/70">Distance:</span>
                <span className="text-white font-medium">{workout.target_distance_km} km</span>
              </div>
            )}
            
            {workout.target_pace_per_km && (
              <div className="flex justify-between">
                <span className="text-white/70">Target Pace:</span>
                <span className="text-white font-medium">{formatPace(workout.target_pace_per_km)}</span>
              </div>
            )}
            
            {workout.target_power_watts && (
              <div className="flex justify-between">
                <span className="text-white/70">Power:</span>
                <span className="text-white font-medium">{workout.target_power_watts}W</span>
              </div>
            )}
            
            {workout.target_heart_rate_zone && (
              <div className="flex justify-between">
                <span className="text-white/70">HR Zone:</span>
                <span className="text-white font-medium">{workout.target_heart_rate_zone}</span>
              </div>
            )}
            
            {workout.target_tss && (
              <div className="flex justify-between">
                <span className="text-white/70">TSS:</span>
                <span className="text-white font-medium">{workout.target_tss}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-white/70">Intensity:</span>
              <span className="text-white font-medium">{workout.intensity}</span>
            </div>
          </div>
        </div>
      )}

      {/* Structured Workout */}
      {hasStructuredWorkout && (
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">🏃‍♂️ Workout Structure</h4>
          <div className="space-y-3">
            {workout.warmup && (
              <div>
                <h5 className="text-xs font-medium text-green-300 mb-1 uppercase tracking-wide">
                  Warm-up
                </h5>
                <p className="text-white/80 text-sm leading-relaxed">
                  {workout.warmup}
                </p>
              </div>
            )}
            
            {workout.main_set && (
              <div>
                <h5 className="text-xs font-medium text-red-300 mb-1 uppercase tracking-wide">
                  Main Set
                </h5>
                <p className="text-white/80 text-sm leading-relaxed">
                  {workout.main_set}
                </p>
              </div>
            )}
            
            {workout.cooldown && (
              <div>
                <h5 className="text-xs font-medium text-blue-300 mb-1 uppercase tracking-wide">
                  Cool-down
                </h5>
                <p className="text-white/80 text-sm leading-relaxed">
                  {workout.cooldown}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {workout.notes && (
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">📝 Workout Notes</h4>
          <p className="text-white/80 text-sm leading-relaxed">
            {workout.notes}
          </p>
        </div>
      )}

      {/* Workout Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-200 mb-2">💡 Tips</h4>
        <div className="text-blue-100 text-xs space-y-1">
          {workout.workout_type === 'intervals' && (
            <>
              <p>• Focus on hitting your target power/pace during work intervals</p>
              <p>• Use recovery intervals to prepare for the next effort</p>
              <p>• Stop if form deteriorates significantly</p>
            </>
          )}
          
          {workout.workout_type === 'endurance' && (
            <>
              <p>• Maintain steady effort throughout the session</p>
              <p>• Stay hydrated, especially on longer sessions</p>
              <p>• Practice race nutrition if session is 90+ minutes</p>
            </>
          )}
          
          {workout.workout_type === 'tempo' && (
            <>
              <p>• This should feel "comfortably hard"</p>
              <p>• You should be able to speak 2-3 words at most</p>
              <p>• Focus on smooth, controlled breathing</p>
            </>
          )}
          
          {workout.workout_type === 'recovery' && (
            <>
              <p>• Keep effort very easy - you should feel refreshed after</p>
              <p>• Focus on form and movement quality</p>
              <p>• This helps with active recovery and blood flow</p>
            </>
          )}
          
          {workout.workout_type === 'strength' && (
            <>
              <p>• Focus on proper form over heavy weights</p>
              <p>• Allow adequate rest between sets</p>
              <p>• Stop if you can't maintain good technique</p>
            </>
          )}
          
          {!['intervals', 'endurance', 'tempo', 'recovery', 'strength'].includes(workout.workout_type) && (
            <>
              <p>• Listen to your body and adjust intensity if needed</p>
              <p>• Stay consistent with your effort throughout</p>
              <p>• Focus on good form and technique</p>
            </>
          )}
        </div>
      </div>

      {/* Sport-specific advice */}
      {workout.sport === 'running' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-200 mb-2">🏃‍♂️ Running Focus</h4>
          <div className="text-green-100 text-xs space-y-1">
            <p>• Land midfoot with slight forward lean</p>
            <p>• Maintain 180+ steps per minute cadence</p>
            <p>• Keep shoulders relaxed and arms at 90 degrees</p>
          </div>
        </div>
      )}
      
      {workout.sport === 'cycling' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-200 mb-2">🚴‍♂️ Cycling Focus</h4>
          <div className="text-yellow-100 text-xs space-y-1">
            <p>• Maintain steady pedal stroke and cadence</p>
            <p>• Keep core engaged and shoulders relaxed</p>
            <p>• Practice shifting and cornering skills</p>
          </div>
        </div>
      )}
      
      {workout.sport === 'swimming' && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-cyan-200 mb-2">🏊‍♂️ Swimming Focus</h4>
          <div className="text-cyan-100 text-xs space-y-1">
            <p>• Focus on long, smooth strokes</p>
            <p>• Maintain consistent breathing pattern</p>
            <p>• Practice sighting for open water if applicable</p>
          </div>
        </div>
      )}
    </div>
  );
}