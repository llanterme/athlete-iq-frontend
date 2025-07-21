import { Card } from '@/components/ui/Card';
import { ActivityStats } from '@/types/strava';
import { formatDistance, formatTime, formatElevation } from '@/lib/strava';

interface ActivityStatsCardProps {
  title: string;
  stats: ActivityStats;
  icon: string;
}

export function ActivityStatsCard({ title, stats, icon }: ActivityStatsCardProps) {
  return (
    <Card glass className="text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-white/60 text-sm">Count</p>
          <p className="font-semibold text-xl">{stats.count}</p>
        </div>
        <div>
          <p className="text-white/60 text-sm">Distance</p>
          <p className="font-semibold text-xl">{formatDistance(stats.distance)}</p>
        </div>
        <div>
          <p className="text-white/60 text-sm">Time</p>
          <p className="font-semibold text-xl">{formatTime(stats.moving_time)}</p>
        </div>
        <div>
          <p className="text-white/60 text-sm">Elevation</p>
          <p className="font-semibold text-xl">{formatElevation(stats.elevation_gain)}</p>
        </div>
      </div>
    </Card>
  );
}