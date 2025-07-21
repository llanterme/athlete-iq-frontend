"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient, IngestionStatus } from '@/lib/api';

interface ActivityIngestionProps {
  onIngestionComplete?: () => void;
}

interface UserStats {
  total_activities: number;
  ingestion_status: IngestionStatus | null;
}

export function ActivityIngestion({ onIngestionComplete }: ActivityIngestionProps) {
  const { data: session } = useSession();
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [config, setConfig] = useState<any>(null);

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch user stats on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/${session.user.id}/stats`);
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
      }
    };

    fetchUserStats();
    
    // Fetch system config
    const fetchConfig = async () => {
      try {
        const configData = await apiClient.getConfig();
        setConfig(configData);
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };
    
    fetchConfig();
  }, [session?.user?.id]);

  const startIngestion = async (fullSync: boolean = false) => {
    if (!session?.user) {
      setError('Authentication required - no user session');
      return;
    }

    const userId = session.user.id || session.user.stravaId?.toString();
    if (!userId || !session?.accessToken || !session?.refreshToken) {
      setError(`Authentication required - missing: ${!userId ? 'userId' : ''} ${!session?.accessToken ? 'accessToken' : ''} ${!session?.refreshToken ? 'refreshToken' : ''}`);
      return;
    }

    setIsIngesting(true);
    setError(null);

    try {
      await apiClient.startIngestion({
        user_id: userId,
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
        full_sync: fullSync,
      });

      // Start polling for status
      const interval = setInterval(async () => {
        try {
          const status = await apiClient.getIngestionStatus(userId);
          setIngestionStatus(status);

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval);
            setIsIngesting(false);
            
            if (status.status === 'completed') {
              // Refresh user stats after completion
              const fetchUserStats = async () => {
                try {
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/${userId}/stats`);
                  if (response.ok) {
                    const stats = await response.json();
                    setUserStats(stats);
                  }
                } catch (err) {
                  console.error('Error fetching user stats:', err);
                }
              };
              fetchUserStats();
              
              if (onIngestionComplete) {
                onIngestionComplete();
              }
            }
          }
        } catch (err) {
          console.error('Error polling ingestion status:', err);
        }
      }, 2000);

      setPollingInterval(interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start ingestion');
      setIsIngesting(false);
    }
  };

  const getProgressPercentage = () => {
    if (!ingestionStatus || ingestionStatus.total_activities === 0) return 0;
    return Math.round((ingestionStatus.processed_activities / ingestionStatus.total_activities) * 100);
  };


  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'in_progress':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⚡';
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20';
      case 'completed':
        return 'text-green-400 bg-green-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-strava-orange to-primary-400 rounded-xl flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Activity Sync</h2>
            <p className="text-white/60 text-sm">
              Sync your Strava activities for AI analysis
              {config && (
                <span className="ml-2 text-xs">
                  ({config.sync_period_description})
                  {config.is_test_mode && (
                    <span className="ml-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                      TEST MODE
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Status Card */}
      {ingestionStatus && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusEmoji(ingestionStatus.status)}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(ingestionStatus.status)}`}>
                {ingestionStatus.status.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {ingestionStatus.processed_activities} / {ingestionStatus.total_activities}
              </div>
              <div className="text-white/60 text-xs">activities processed</div>
            </div>
          </div>
          
          {ingestionStatus.status === 'in_progress' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Progress</span>
                <span className="text-white">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-strava-orange to-primary-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full"></div>
                <span>Analyzing your activities...</span>
              </div>
            </div>
          )}
          
          {ingestionStatus.status === 'completed' && (
            <div className="flex items-center space-x-2 text-green-400">
              <span className="text-sm">🎉 Successfully processed all activities!</span>
            </div>
          )}
          
          {ingestionStatus.status === 'failed' && ingestionStatus.error_message && (
            <div className="text-red-400 text-sm">
              ❌ {ingestionStatus.error_message}
            </div>
          )}
        </div>
      )}

      {/* Stats Display */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{userStats.total_activities}</div>
              <div className="text-white/60 text-sm">Total Activities</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-strava-orange">🤖</div>
              <div className="text-white/60 text-sm">AI Ready</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">💡</div>
              <div className="text-white/60 text-sm">Smart Search</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => startIngestion(false)}
          disabled={isIngesting}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            isIngesting 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-strava-orange to-primary-400 text-white hover:from-strava-orange/90 hover:to-primary-400/90 transform hover:scale-[1.02]'
          }`}
        >
          {isIngesting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
              <span>Syncing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🔄</span>
              <span>Quick Sync</span>
            </div>
          )}
        </button>
        
        <button
          onClick={() => startIngestion(true)}
          disabled={isIngesting}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            isIngesting 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/30'
          }`}
        >
          {isIngesting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
              <span>Syncing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🔄</span>
              <span>Full Sync</span>
            </div>
          )}
        </button>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-white mb-2">⚡ Quick Sync</h4>
              <p className="text-white/60">
                Syncs recent activities and updates existing data. Perfect for regular updates.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🔄 Full Sync</h4>
              <p className="text-white/60">
                Re-processes all activities with enhanced AI analysis. Use after system updates.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">💡</span>
              <div className="text-sm">
                <p className="text-blue-300 font-medium">Enhanced AI Analysis</p>
                <p className="text-blue-200/80 mt-1">
                  Full sync enables temporal queries like "yesterday's ride" and metric filters like "power above 200W".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">❌</span>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}