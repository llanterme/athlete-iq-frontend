import { useState } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Race } from '@/types/race';
import { TrainingPlanFormData } from '@/types/training-plan';
import { RACE_TYPE_ICONS } from '@/types/race';

interface RaceSelectionStepProps {
  races: Race[];
  loading: boolean;
  selectedRaceId?: number;
  onNext: (data: Partial<TrainingPlanFormData>) => void;
}

export function RaceSelectionStep({ races, loading, selectedRaceId, onNext }: RaceSelectionStepProps) {
  const [selected, setSelected] = useState<number | undefined>(selectedRaceId);

  const handleNext = () => {
    if (selected) {
      onNext({ race_id: selected });
    }
  };

  // Ensure races is always an array to prevent filter errors
  const safeRaces = Array.isArray(races) ? races : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Select Your Race</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-navy-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter to upcoming races only and sort by date
  const upcomingRaces = safeRaces
    .filter(race => {
      const raceDate = parseISO(race.race_date);
      return differenceInDays(raceDate, new Date()) >= 0;
    })
    .sort((a, b) => {
      const dateA = parseISO(a.race_date);
      const dateB = parseISO(b.race_date);
      return dateA.getTime() - dateB.getTime();
    });

  if (upcomingRaces.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏁</div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          No Upcoming Races Found
        </h3>
        <p className="text-gray-400 mb-6">
          You need to add a race before creating a training plan. 
        </p>
        <Button
          onClick={() => window.open('/races', '_blank')}
          variant="primary"
        >
          Add Your First Race
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 training-plan-form">
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          Select Your Race
        </h3>
        <p className="text-gray-400">
          Choose the race you want to train for. Your training plan will be tailored to this specific event.
        </p>
      </div>

      <div className="space-y-3">
        {upcomingRaces.map((race) => {
          const raceDate = parseISO(race.race_date);
          const daysUntil = differenceInDays(raceDate, new Date());
          const isSelected = selected === parseInt(race.id);
          
          return (
            <Card
              key={race.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-orange-500 bg-orange-950/20' 
                  : 'hover:bg-navy-800/30'
              }`}
              onClick={() => setSelected(parseInt(race.id))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {RACE_TYPE_ICONS[race.race_type] || '🏃‍♂️'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">
                      {race.race_type}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {format(raceDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    daysUntil <= 60
                      ? 'bg-red-100 text-red-800'
                      : daysUntil <= 120
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {daysUntil} days away
                  </div>
                  {daysUntil < 60 && (
                    <p className="text-xs text-orange-400 mt-1">
                      Short preparation time
                    </p>
                  )}
                </div>
                
                {isSelected && (
                  <div className="ml-4 text-orange-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {upcomingRaces.length > 0 && (
        <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-400 text-lg mr-3">💡</div>
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Training Plan Tips:</p>
              <ul className="space-y-1 text-blue-400">
                <li>• Plans work best with 12+ weeks of preparation time</li>
                <li>• Consider your current fitness level when selecting races</li>
                <li>• You can create multiple plans for different races</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selected}
          variant="primary"
          size="lg"
        >
          Continue to Training Setup
        </Button>
      </div>
    </div>
  );
}