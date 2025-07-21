"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';

export function FitnessInsights() {
  const { data: session } = useSession();
  const [insights, setInsights] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    if (!session?.user) return;

    const userId = session.user.id || session.user.stravaId?.toString();
    if (!userId) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getFitnessInsights({
        user_id: userId,
        time_period: timePeriod,
      });

      setInsights(response.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [session?.user?.id, timePeriod]);

  const formatInsights = (text: string) => {
    // Simple formatting to make the insights more readable
    return text
      .split('\n')
      .map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Check if it's a heading (starts with number and period)
        if (trimmed.match(/^\d+\./)) {
          return (
            <h3 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2">
              {trimmed}
            </h3>
          );
        }

        // Check if it's a bullet point
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          return (
            <li key={index} className="text-gray-700 ml-4 mb-1">
              {trimmed.substring(1).trim()}
            </li>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className="text-gray-700 mb-2">
            {trimmed}
          </p>
        );
      })
      .filter(Boolean);
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Fitness Insights</h2>
        
        <div className="flex items-center gap-2">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
          
          <Button
            onClick={loadInsights}
            disabled={isLoading}
            loading={isLoading}
            variant="secondary"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your fitness data...</p>
          </div>
        </div>
      ) : insights ? (
        <div className="prose max-w-none">
          <div className="space-y-2">
            {formatInsights(insights)}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 mb-4">No insights available yet</p>
          <p className="text-gray-500 text-sm">
            Make sure you have synced your activities to get personalized insights
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm">
          <strong>💡 Tip:</strong> Insights are generated based on your Strava activities using AI analysis. 
          The more data you have, the better the insights will be!
        </p>
      </div>
    </Card>
  );
}