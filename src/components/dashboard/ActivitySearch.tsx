"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiClient, SearchResult } from '@/lib/api';

export function ActivitySearch() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!session?.user || !query.trim()) {
      return;
    }

    const userId = session.user.id || session.user.stravaId?.toString();
    if (!userId) {
      setError('Authentication required - no user ID');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await apiClient.searchActivities({
        user_id: userId,
        query: query.trim(),
        top_k: 10,
      });

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDistance = (distance: number) => {
    return (distance / 1000).toFixed(1) + ' km';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Search Your Activities</h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your activities... (e.g., 'my longest run this year')"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            loading={isSearching}
            variant="primary"
          >
            Search
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">
            Search Results ({results.length})
          </h3>
          
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.activity_id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full">
                      {result.activity_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(result.start_date)}
                    </span>
                    <span className="text-xs text-gray-400">
                      Match: {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-white text-sm mb-2 line-clamp-2">
                  {result.summary}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-300">
                  {result.distance > 0 && (
                    <span>📏 {formatDistance(result.distance)}</span>
                  )}
                  {result.moving_time > 0 && (
                    <span>⏱️ {formatTime(result.moving_time)}</span>
                  )}
                  {result.metadata.total_elevation_gain > 0 && (
                    <span>⛰️ {result.metadata.total_elevation_gain}m</span>
                  )}
                  {result.metadata.average_heartrate && (
                    <span>💓 {result.metadata.average_heartrate} bpm</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && query && !isSearching && !error && (
        <div className="text-center py-8 text-gray-400">
          <p>No activities found matching your query.</p>
          <p className="text-sm mt-1">Try a different search term or make sure your activities are ingested.</p>
        </div>
      )}

      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm">
          <strong>Examples:</strong> "my best 10K run", "cycling activities in July", "longest distance this month", "activities with high heart rate"
        </p>
      </div>
    </Card>
  );
}