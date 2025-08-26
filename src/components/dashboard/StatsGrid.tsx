import { StravaStats } from '@/types/strava';
import { ActivityStatsCard } from './ActivityStatsCard';

interface StatsGridProps {
  stats: StravaStats;
}

const getSportIcon = (sportType: string) => {
  const icons = {
    rides: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
      </svg>
    ),
    runs: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l-4 4-4-4m8 0V3m-8 14V3" />
      </svg>
    ),
    swims: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4-2 4 2 4-2v11l-4 2-4-2-4 2V8z" />
      </svg>
    ),
  };
  return icons[sportType as keyof typeof icons] || icons.runs;
};

export function StatsGrid({ stats }: StatsGridProps) {
  const recentStats = [];

  // Recent Activities (Last 4 Weeks)
  if (stats.recent_ride_totals && stats.recent_ride_totals.count > 0) {
    recentStats.push({
      title: 'Cycling',
      subtitle: 'Last 4 weeks',
      stats: stats.recent_ride_totals,
      icon: getSportIcon('rides'),
      color: 'from-fitness-blue-500 to-fitness-blue-600',
      sport: 'cycling'
    });
  }

  if (stats.recent_run_totals && stats.recent_run_totals.count > 0) {
    recentStats.push({
      title: 'Running',
      subtitle: 'Last 4 weeks',
      stats: stats.recent_run_totals,
      icon: getSportIcon('runs'),
      color: 'from-fitness-red-500 to-fitness-red-600',
      sport: 'running'
    });
  }

  if (stats.recent_swim_totals && stats.recent_swim_totals.count > 0) {
    recentStats.push({
      title: 'Swimming',
      subtitle: 'Last 4 weeks',
      stats: stats.recent_swim_totals,
      icon: getSportIcon('swims'),
      color: 'from-fitness-blue-400 to-fitness-blue-500',
      sport: 'swimming'
    });
  }

  if (recentStats.length === 0) {
    return (
      <div className="fitness-card p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-fitness-navy-600 to-fitness-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-fitness-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Recent Activities</h3>
        <p className="text-fitness-navy-300 text-sm">
          Your Strava activities will appear here once you sync your data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Recent Performance</h2>
          <p className="text-fitness-navy-300 text-sm mt-1">
            Your activity summary from the last 4 weeks
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-xs text-fitness-navy-400">
          <div className="w-1 h-1 bg-fitness-orange-400 rounded-full"></div>
          <span>Live from Strava</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {recentStats.map((stat, index) => (
          <ActivityStatsCard
            key={stat.sport}
            title={stat.title}
            subtitle={stat.subtitle}
            stats={stat.stats}
            icon={stat.icon}
            color={stat.color}
            sport={stat.sport}
          />
        ))}
      </div>
    </div>
  );
}