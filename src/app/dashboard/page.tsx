'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { StravaAPI } from '../../lib/strava';
import { StravaAthlete, StravaStats } from '../../types/strava';
import { Navigation } from '../../components/dashboard/Navigation';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { ActivityIngestion } from '../../components/dashboard/ActivityIngestion';
import { ChatInterface } from '../../components/chat/ChatInterface';
import { FitnessDashboard } from '../../components/dashboard/FitnessDashboard';
import { NextRaceWidget } from '../../components/races/NextRaceWidget';
import { TrainingPlanWidget } from '../../components/training-plan/TrainingPlanWidget';
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
      <div className="min-h-screen bg-fitness-gradient">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-fitness-navy-600 border-t-fitness-orange-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-fitness-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-white mt-6 font-medium">Loading your session...</p>
            <p className="text-fitness-navy-300 text-sm mt-2">Setting up your performance dashboard</p>
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
      <div className="min-h-screen bg-fitness-gradient">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-fitness-navy-600 border-t-fitness-orange-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-fitness-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-white mt-6 font-medium">Loading your profile...</p>
            <p className="text-fitness-navy-300 text-sm mt-2">Fetching your latest Strava data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fitness-gradient">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="fitness-card max-w-md mx-4 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-fitness-red-500 to-fitness-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.734-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
            <p className="text-fitness-navy-300 mb-6 text-sm leading-relaxed">
              {error instanceof Error ? error.message : 'Failed to load data from Strava'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              size="lg"
              className="w-full"
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
      <div className="min-h-screen bg-fitness-gradient">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="fitness-card max-w-md mx-4 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-fitness-navy-600 to-fitness-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-fitness-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-3">No Data Available</h2>
            <p className="text-fitness-navy-300 text-sm">
              Your Strava profile data is not available. Please check your connection and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitness-gradient">
      <Navigation />
      
      {/* Hero section with performance metrics overview */}
      <div className="bg-gradient-to-r from-fitness-navy-900/50 via-fitness-navy-800/30 to-fitness-navy-900/50 border-b border-fitness-navy-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Performance Dashboard</h1>
              <p className="text-fitness-navy-300 mt-1">
                Track your training progress and fitness metrics
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-fitness-navy-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-fitness-green-400 rounded-full animate-pulse"></div>
                <span>Data synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8 animate-fade-in">
          {/* Key Metrics Grid */}
          <section className="animate-slide-up">
            <StatsGrid stats={stats} />
          </section>
          
          {/* Quick Actions: Race and Training Plan Widgets */}
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="mb-6">
              <h2 className="section-title mb-2">Quick Actions</h2>
              <p className="text-fitness-navy-300 text-sm">
                Manage your races and training plans
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <NextRaceWidget onViewAllRaces={() => router.push('/races')} />
              <TrainingPlanWidget onViewAllPlans={() => router.push('/training-plan')} />
            </div>
          </section>
          
          {/* Data Management */}
          <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ActivityIngestion onIngestionComplete={handleIngestionComplete} />
          </section>
          
          {/* Advanced Analytics */}
          <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="mb-6">
              <h2 className="section-title mb-2">Training Analytics</h2>
              <p className="text-fitness-navy-300 text-sm">
                Deep dive into your fitness metrics and performance trends
              </p>
            </div>
            <FitnessDashboard key={fitnessDataKey} />
          </section>
          
          {/* AI Assistant */}
          <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="mb-6">
              <h2 className="section-title mb-2">AI Performance Coach</h2>
              <p className="text-fitness-navy-300 text-sm">
                Get personalized insights and training recommendations
              </p>
            </div>
            <ChatInterface />
          </section>
        </div>
      </main>
      
      {/* Footer with additional context */}
      <footer className="bg-gradient-to-r from-fitness-navy-900/80 to-fitness-navy-800/80 border-t border-fitness-navy-700/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-xs text-fitness-navy-400">
            <div className="flex items-center space-x-4">
              <span>© 2024 Athlete IQ</span>
              <span>•</span>
              <span>Powered by AI & Strava Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}