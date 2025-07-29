'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { RaceWithCountdown, RACE_TYPE_ICONS } from '@/types/race';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { addCountdownToRaces, getNextRace, formatCountdown } from '@/lib/raceUtils';

interface NextRaceWidgetProps {
  onViewAllRaces: () => void;
}

export function NextRaceWidget({ onViewAllRaces }: NextRaceWidgetProps) {
  const { data: session } = useSession();

  const { data: races, isLoading, error } = useQuery({
    queryKey: ['races', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      try {
        const racesData = await apiClient.getUserRaces(session.user.id, true);
        console.log('Widget - Raw API response:', racesData);
        const processedRaces = addCountdownToRaces(racesData);
        console.log('Widget - Processed races:', processedRaces);
        return processedRaces;
      } catch (err) {
        // If the API returns 404 or races don't exist yet, return empty array
        console.warn('Failed to fetch races for widget:', err);
        return [];
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  });

  if (isLoading) {
    return (
      <Card glass className="animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Next Race</h3>
        </div>
        <div className="h-12 bg-white/10 rounded"></div>
      </Card>
    );
  }

  if (!races) {
    return null; // Don't render if no data yet
  }

  const nextRace = getNextRace(races);

  if (!nextRace) {
    return (
      <Card glass>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Next Race</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllRaces}
            className="text-white/60 hover:text-white text-xs"
          >
            Add Race
          </Button>
        </div>
        <div className="text-center py-4">
          <div className="text-3xl mb-2">🏁</div>
          <p className="text-white/70 text-sm">No upcoming races</p>
          <p className="text-white/50 text-xs mt-1">Add your next race to start planning!</p>
        </div>
      </Card>
    );
  }

  const getCountdownColor = () => {
    if (nextRace.daysUntilRace <= 7) return 'text-red-400';
    if (nextRace.daysUntilRace <= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <Card glass className={nextRace.daysUntilRace <= 7 ? 'ring-2 ring-red-400/30' : ''}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Next Race</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAllRaces}
          className="text-white/60 hover:text-white text-xs"
        >
          View All
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label={nextRace.race_type}>
          {RACE_TYPE_ICONS[nextRace.race_type]}
        </span>
        <div className="flex-1">
          <p className="text-white font-medium text-sm">
            {nextRace.race_type}
          </p>
          <p className="text-white/70 text-xs">
            {new Date(nextRace.race_date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className={`text-right font-semibold ${getCountdownColor()}`}>
          <div className="text-lg leading-none">
            {nextRace.daysUntilRace === 0 ? '🔥' : nextRace.daysUntilRace}
          </div>
          <div className="text-xs opacity-80">
            {nextRace.daysUntilRace === 0 ? 'Today!' : 'days'}
          </div>
        </div>
      </div>

      {nextRace.daysUntilRace <= 14 && nextRace.daysUntilRace > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-white/60 text-center">
            🎯 Race preparation time!
          </div>
        </div>
      )}
    </Card>
  );
}