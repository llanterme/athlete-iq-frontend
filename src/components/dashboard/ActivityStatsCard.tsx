import { Card } from '@/components/ui/Card';
import { ActivityStats } from '@/types/strava';
import { formatDistance, formatTime, formatElevation } from '@/lib/strava';
import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ActivityStatsCardProps {
  title: string;
  subtitle?: string;
  stats: ActivityStats;
  icon: ReactNode;
  color?: string;
  sport?: string;
}

export function ActivityStatsCard({ 
  title, 
  subtitle, 
  stats, 
  icon, 
  color = 'from-fitness-navy-600 to-fitness-navy-700',
  sport 
}: ActivityStatsCardProps) {
  const metrics = [
    {
      label: 'Activities',
      value: stats.count.toString(),
      suffix: '',
      description: 'total sessions'
    },
    {
      label: 'Distance',
      value: formatDistance(stats.distance),
      suffix: '',
      description: 'covered'
    },
    {
      label: 'Time',
      value: formatTime(stats.moving_time),
      suffix: '',
      description: 'moving'
    },
    {
      label: 'Elevation',
      value: formatElevation(stats.elevation_gain),
      suffix: '',
      description: 'gained'
    }
  ];

  // Calculate some additional insights
  const avgDistance = stats.count > 0 ? stats.distance / stats.count : 0;
  const avgTime = stats.count > 0 ? stats.moving_time / stats.count : 0;

  return (
    <Card variant="interactive" className="group overflow-hidden">
      {/* Header with sport icon and title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center text-white',
            `bg-gradient-to-br ${color}`
          )}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && (
              <p className="text-xs text-fitness-navy-400 font-medium">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Quick summary badge */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg px-2 py-1 border border-white/10">
          <span className="text-xs font-semibold text-fitness-navy-200">{stats.count}</span>
        </div>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {metrics.map((metric, index) => (
          <div key={metric.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="metric-label text-xs">{metric.label}</span>
            </div>
            <div className="font-mono font-bold text-lg text-white">
              {metric.value}
              {metric.suffix && <span className="text-fitness-navy-400 text-sm ml-1">{metric.suffix}</span>}
            </div>
            <p className="text-xs text-fitness-navy-400">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Additional insights */}
      {stats.count > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between text-xs text-fitness-navy-300">
            <div className="text-center">
              <p className="font-medium">{formatDistance(avgDistance)}</p>
              <p className="text-fitness-navy-400">avg distance</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{formatTime(avgTime)}</p>
              <p className="text-fitness-navy-400">avg time</p>
            </div>
            <div className="text-center">
              <p className="font-medium">
                {stats.moving_time > 0 ? (((stats.distance / 1000) / (stats.moving_time / 3600)).toFixed(1) + ' km/h') : 'N/A'}
              </p>
              <p className="text-fitness-navy-400">avg pace</p>
            </div>
          </div>
        </div>
      )}

      {/* Hover effect indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fitness-orange-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}