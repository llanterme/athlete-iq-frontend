'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StravaAPI } from '../../lib/strava';
import { StravaAthlete, StravaStats } from '../../types/strava';
import { Navigation } from '../../components/dashboard/Navigation';
import { ProfileHeader } from '../../components/dashboard/ProfileHeader';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { ActivityIngestion } from '../../components/dashboard/ActivityIngestion';
import { ChatInterface } from '../../components/chat/ChatInterface';
import { FitnessDashboard } from '../../components/dashboard/FitnessDashboard';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [stats, setStats] = useState<StravaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fitnessDataKey, setFitnessDataKey] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Only fetch data if we don't have it yet
    if (athlete && stats) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!session.accessToken) {
          throw new Error('No access token available');
        }

        const stravaApi = new StravaAPI(session.accessToken);
        
        // Fetch athlete data
        const athleteData = await stravaApi.getAthlete();
        setAthlete(athleteData);

        // Fetch stats
        const statsData = await stravaApi.getAthleteStats(athleteData.id);
        setStats(statsData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session?.accessToken, router, athlete, stats]);

  const handleIngestionComplete = () => {
    // Force FitnessDashboard to re-fetch data by changing its key
    setFitnessDataKey(prev => prev + 1);
  };

  if (status === 'loading' || loading) {
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
            <p className="text-white/80 mb-6">{error}</p>
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