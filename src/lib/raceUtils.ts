import { Race, RaceWithCountdown } from '@/types/race';

export function calculateDaysUntilRace(raceDate: string): number {
  const race = new Date(raceDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = race.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatRaceDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function addCountdownToRaces(races: any): RaceWithCountdown[] {
  // Handle various response formats from the API
  if (!races) {
    return [];
  }
  
  // If it's already an array, use it directly
  if (Array.isArray(races)) {
    return races.map((race: any) => ({
      ...race,
      daysUntilRace: calculateDaysUntilRace(race.race_date),
      isPast: calculateDaysUntilRace(race.race_date) < 0
    }));
  }
  
  // If it's a single race object, wrap it in an array
  if (races.race_type && races.race_date) {
    return [{
      ...races,
      daysUntilRace: calculateDaysUntilRace(races.race_date),
      isPast: calculateDaysUntilRace(races.race_date) < 0
    }];
  }
  
  // If it's a wrapper object, try to extract races array
  if (races.races && Array.isArray(races.races)) {
    return races.races.map((race: any) => ({
      ...race,
      daysUntilRace: calculateDaysUntilRace(race.race_date),
      isPast: calculateDaysUntilRace(race.race_date) < 0
    }));
  }
  
  // Log the unexpected format for debugging
  console.warn('Unexpected races data format:', races);
  return [];
}

export function sortRacesByDate(races: RaceWithCountdown[]): RaceWithCountdown[] {
  return [...races].sort((a, b) => {
    const dateA = new Date(a.race_date + 'T00:00:00');
    const dateB = new Date(b.race_date + 'T00:00:00');
    return dateA.getTime() - dateB.getTime();
  });
}

export function getUpcomingRaces(races: RaceWithCountdown[]): RaceWithCountdown[] {
  return races.filter(race => !race.isPast);
}

export function getNextRace(races: RaceWithCountdown[]): RaceWithCountdown | null {
  const upcoming = getUpcomingRaces(races);
  const sorted = sortRacesByDate(upcoming);
  return sorted.length > 0 ? sorted[0] : null;
}

export function formatCountdown(daysUntilRace: number): string {
  if (daysUntilRace < 0) {
    const daysPast = Math.abs(daysUntilRace);
    return `${daysPast} day${daysPast === 1 ? '' : 's'} ago`;
  } else if (daysUntilRace === 0) {
    return 'Today!';
  } else if (daysUntilRace === 1) {
    return 'Tomorrow!';
  } else {
    return `${daysUntilRace} days to go`;
  }
}