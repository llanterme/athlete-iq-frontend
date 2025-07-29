'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { StravaAPI } from '../../lib/strava';
import { StravaAthlete, StravaStats } from '../../types/strava';
import { Navigation } from '../../components/dashboard/Navigation';
import { ProfileHeader } from '../../components/dashboard/ProfileHeader';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { ActivityIngestion } from '../../components/dashboard/ActivityIngestion';
import { ChatInterface } from '../../components/chat/ChatInterface';
import { FitnessDashboard } from '../../components/dashboard/FitnessDashboard';
import { NextRaceWidget } from '../../components/races/NextRaceWidget';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fitnessDataKey, setFitnessDataKey] = useState(0);

  // Fetch athlete data with React Query
  const { data: athlete, isLoading: athleteLoading, error: athleteError } = useQuery({
    queryKey: ['athlete', session?.accessToken],
    queryFn: async () => {
      if (!session?.accessToken) throw new Error('No access token available');
      const stravaApi = new StravaAPI(session.accessToken);
      return stravaApi.getAthlete();
    },
    enabled: !!session?.accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes - athlete data doesn't change often
  });

  // Fetch athlete stats with React Query
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['athleteStats', athlete?.id],
    queryFn: async () => {
      if (!athlete?.id || !session?.accessToken) throw new Error('Missing athlete ID or access token');
      const stravaApi = new StravaAPI(session.accessToken);
      return stravaApi.getAthleteStats(athlete.id);
    },
    enabled: !!athlete?.id && !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats can change more frequently
  });

  const loading = athleteLoading || statsLoading;
  const error = athleteError || statsError;

  const handleIngestionComplete = () => {
    // Force FitnessDashboard to re-fetch data by changing its key
    setFitnessDataKey(prev => prev + 1);
  };

  // Handle authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading your session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
            <p className="text-white/80 mb-6">
              {error instanceof Error ? error.message : 'Failed to load data'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!athlete || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-white">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ProfileHeader athlete={athlete} />
          <StatsGrid stats={stats} />
          
          {/* Next Race Widget */}
          <NextRaceWidget onViewAllRaces={() => router.push('/races')} />
          
          {/* Activity Ingestion */}
          <ActivityIngestion onIngestionComplete={handleIngestionComplete} />
          
          {/* Fitness Dashboard */}
          <FitnessDashboard key={fitnessDataKey} />
          
          {/* Chat Interface */}
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}