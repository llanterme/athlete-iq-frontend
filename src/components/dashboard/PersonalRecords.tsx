import { Card } from '@/components/ui/Card';
import { StravaStats } from '@/types/strava';
import { formatDistance, formatElevation } from '@/lib/strava';

interface PersonalRecordsProps {
  stats: StravaStats;
}

export function PersonalRecords({ stats }: PersonalRecordsProps) {
  const hasRecords = stats.biggest_ride_distance || stats.biggest_climb_elevation_gain;

  if (!hasRecords) {
    return null;
  }

  return (
    <Card glass className="text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🏆 Personal Records</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.biggest_ride_distance && (
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm">Longest Ride</p>
            <p className="font-semibold text-2xl">{formatDistance(stats.biggest_ride_distance)}</p>
          </div>
        )}
        {stats.biggest_climb_elevation_gain && (
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm">Biggest Climb</p>
            <p className="font-semibold text-2xl">{formatElevation(stats.biggest_climb_elevation_gain)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}