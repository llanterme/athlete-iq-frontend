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
      <Card variant="interactive" className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fitness-red-500/20 to-fitness-orange-500/20 rounded-xl"></div>
            <div>
              <div className="h-4 bg-white/10 rounded w-20 mb-1"></div>
              <div className="h-3 bg-white/5 rounded w-16"></div>
            </div>
          </div>
        </div>
        <div className="loading-shimmer h-16 rounded-xl"></div>
      </Card>
    );
  }

  if (!races) {
    return null; // Don't render if no data yet
  }

  const nextRace = getNextRace(races);

  if (!nextRace) {
    return (
      <Card variant="interactive">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fitness-red-500 to-fitness-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Next Race</h3>
              <p className="text-fitness-navy-400 text-xs">Goal-driven training</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllRaces}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Race
          </Button>
        </div>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-br from-fitness-navy-600/50 to-fitness-navy-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-fitness-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-white font-medium text-sm mb-1">No upcoming races</p>
          <p className="text-fitness-navy-400 text-xs">Add your next race to start training with purpose!</p>
        </div>
      </Card>
    );
  }

  const getCountdownStyles = () => {
    if (nextRace.daysUntilRace <= 7) {
      return {
        textColor: 'text-fitness-red-400',
        bgColor: 'bg-gradient-to-br from-fitness-red-500/10 to-fitness-red-600/10',
        borderColor: 'border-fitness-red-500/30',
        shadowColor: 'shadow-glow-orange/20'
      };
    }
    if (nextRace.daysUntilRace <= 30) {
      return {
        textColor: 'text-fitness-amber-400',
        bgColor: 'bg-gradient-to-br from-fitness-amber-500/10 to-fitness-amber-600/10',
        borderColor: 'border-fitness-amber-500/30',
        shadowColor: ''
      };
    }
    return {
      textColor: 'text-fitness-green-400',
      bgColor: 'bg-gradient-to-br from-fitness-green-500/10 to-fitness-green-600/10',
      borderColor: 'border-fitness-green-500/30',
      shadowColor: ''
    };
  };

  const countdownStyles = getCountdownStyles();

  return (
    <Card 
      variant={nextRace.daysUntilRace <= 7 ? 'highlighted' : 'interactive'}
      className={nextRace.daysUntilRace <= 7 ? countdownStyles.shadowColor : ''}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-fitness-red-500 to-fitness-orange-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Next Race</h3>
            <p className="text-fitness-navy-400 text-xs">Goal-driven training</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAllRaces}
        >
          View All
        </Button>
      </div>
      
      {/* Race details */}
      <div className={`${countdownStyles.bgColor} ${countdownStyles.borderColor} border rounded-xl p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-2xl" role="img" aria-label={nextRace.race_type}>
              {RACE_TYPE_ICONS[nextRace.race_type]}
            </span>
            <div className="flex-1">
              <p className="text-white font-semibold">
                {nextRace.race_type}
              </p>
              <p className="text-fitness-navy-300 text-sm font-medium">
                {new Date(nextRace.race_date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          {/* Countdown */}
          <div className={`text-center font-bold ${countdownStyles.textColor}`}>
            <div className="text-2xl font-mono leading-none">
              {nextRace.daysUntilRace === 0 ? '🔥' : nextRace.daysUntilRace}
            </div>
            <div className="text-xs uppercase tracking-wide font-semibold opacity-80">
              {nextRace.daysUntilRace === 0 ? 'Today!' : nextRace.daysUntilRace === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>
      </div>

      {/* Race preparation notice */}
      {nextRace.daysUntilRace <= 14 && nextRace.daysUntilRace > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-fitness-orange-500/10 to-fitness-red-500/10 rounded-lg border border-fitness-orange-500/20">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <svg className="w-4 h-4 text-fitness-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-fitness-orange-300 font-medium">
              Peak preparation phase
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}