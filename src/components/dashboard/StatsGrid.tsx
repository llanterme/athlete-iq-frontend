import { StravaStats } from '@/types/strava';
import { ActivityStatsCard } from './ActivityStatsCard';

interface StatsGridProps {
  stats: StravaStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const recentStats = [];

  // Recent Activities (Last 4 Weeks)
  if (stats.recent_ride_totals && stats.recent_ride_totals.count > 0) {
    recentStats.push({
      title: 'Recent Rides',
      stats: stats.recent_ride_totals,
      icon: '🚴',
    });
  }

  if (stats.recent_run_totals && stats.recent_run_totals.count > 0) {
    recentStats.push({
      title: 'Recent Runs',
      stats: stats.recent_run_totals,
      icon: '🏃',
    });
  }

  if (stats.recent_swim_totals && stats.recent_swim_totals.count > 0) {
    recentStats.push({
      title: 'Recent Swims',
      stats: stats.recent_swim_totals,
      icon: '🏊',
    });
  }

  return (
    <div className="space-y-8">
      {recentStats.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">📊 Recent Activities (Last 4 Weeks)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentStats.map((stat, index) => (
              <ActivityStatsCard
                key={index}
                title={stat.title}
                stats={stat.stats}
                icon={stat.icon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}