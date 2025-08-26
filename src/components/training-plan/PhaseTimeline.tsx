import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { TrainingPhase, PHASE_COLORS } from '@/types/training-plan';

// Helper function to parse week ranges like "1-3" or "7" into week count
function parseWeeksFromRange(weekRange: string): number {
  if (weekRange.includes('-')) {
    const [start, end] = weekRange.split('-').map(num => parseInt(num.trim()));
    return end - start + 1;
  }
  return 1; // Single week
}

interface PhaseTimelineProps {
  phases: (TrainingPhase | any)[]; // Allow API response format
  currentWeek?: number;
  totalWeeks: number;
}

export function PhaseTimeline({ phases, currentWeek, totalWeeks }: PhaseTimelineProps) {
  if (!phases || phases.length === 0) {
    return (
      <Card variant="default" className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Training Phases
          </h3>
          <div className="text-center py-8">
            <p className="text-white/70 text-sm">
              Phase data is loading or unavailable. Please check back later.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate current progress as percentage
  const progressPercent = currentWeek ? (currentWeek / totalWeeks) * 100 : 0;

  return (
    <Card variant="default" className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Training Phases
        </h3>
        
        {/* Timeline visualization */}
        <div className="relative">
          {/* Progress indicator */}
          {currentWeek && (
            <div 
              className="absolute top-0 w-0.5 bg-white z-10 rounded-full"
              style={{ 
                left: `${progressPercent}%`,
                height: '100%',
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full border-2 border-tertiary-500"></div>
              <div className="absolute -top-8 -left-6 text-xs text-white font-medium whitespace-nowrap">
                Week {currentWeek}
              </div>
            </div>
          )}
          
          {/* Phase blocks */}
          <div className="flex rounded-lg overflow-hidden" style={{ height: '80px' }}>
            {phases.map((phase, index) => {
              // Handle both API response format and TrainingPhase interface
              const phaseName = phase.phase_name || phase.name;
              const phaseWeeks = typeof phase.weeks === 'string' 
                ? parseWeeksFromRange(phase.weeks)
                : phase.weeks;
              
              // Ensure phase has required properties
              if (!phase || !phaseName || !phaseWeeks) {
                console.warn('Phase missing required data:', phase);
                return null;
              }
              
              const phasePercent = (phaseWeeks / totalWeeks) * 100;
              const phaseColor = PHASE_COLORS[phaseName.toLowerCase() as keyof typeof PHASE_COLORS] || '#6B7280'; // fallback color
              
              return (
                <div
                  key={index}
                  className="relative flex items-center justify-center transition-all duration-200 hover:brightness-110"
                  style={{
                    width: `${phasePercent}%`,
                    backgroundColor: phaseColor,
                    minWidth: '60px'
                  }}
                >
                  <div className="text-center text-white">
                    <div className="font-semibold text-sm capitalize">
                      {phaseName}
                    </div>
                    <div className="text-xs opacity-90">
                      {phaseWeeks}w
                    </div>
                  </div>
                  
                  {/* Phase separator */}
                  {index < phases.length - 1 && (
                    <div className="absolute right-0 top-0 w-px h-full bg-white/20"></div>
                  )}
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>

        {/* Phase details */}
        {phases.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {phases.map((phase, index) => {
              // Handle both API response format and TrainingPhase interface
              const phaseName = phase.phase_name || phase.name;
              const phaseWeeks = typeof phase.weeks === 'string' 
                ? parseWeeksFromRange(phase.weeks)
                : phase.weeks;
              const weekRange = typeof phase.weeks === 'string' ? phase.weeks : `${phaseWeeks}`;
              
              // Ensure phase has required properties
              if (!phase || !phaseName) {
                return null;
              }
              
              return (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg border-l-4 transition-all duration-200 hover:bg-white/10"
                  style={{ borderLeftColor: PHASE_COLORS[phaseName.toLowerCase() as keyof typeof PHASE_COLORS] || '#6B7280' }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white capitalize">
                        {phaseName} Phase
                      </h4>
                      <span className="text-xs text-white/60">
                        Week{phaseWeeks > 1 ? 's' : ''} {weekRange}
                      </span>
                    </div>
                    
                    <div className="text-xs text-white/70 space-y-1">
                      {(phase.start_date && phase.end_date) ? (
                        <div>
                          {format(parseISO(phase.start_date), 'MMM d')} - {format(parseISO(phase.end_date), 'MMM d')}
                        </div>
                      ) : null}
                      <div className="text-white/80">
                        {phase.focus}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        )}

        {/* Phase descriptions */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-3">Phase Overview</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white/70">
            <div>
              <span className="text-green-400 font-medium">Base Phase:</span> Build aerobic endurance and establish training routine
            </div>
            <div>
              <span className="text-yellow-400 font-medium">Build Phase:</span> Increase intensity and sport-specific training
            </div>
            <div>
              <span className="text-red-400 font-medium">Peak Phase:</span> Race-specific intensity and final preparation
            </div>
            <div>
              <span className="text-purple-400 font-medium">Taper Phase:</span> Reduce volume while maintaining intensity
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}