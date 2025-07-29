'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { StravaAPI } from '../../lib/strava';
import { Navigation } from '../../components/dashboard/Navigation';
import { ProfileDetails } from '../../components/profile/ProfileDetails';
import { Button } from '../../components/ui/Button';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch athlete data with React Query (reusing the same query key as dashboard)
  const { data: athlete, isLoading, error } = useQuery({
    queryKey: ['athlete', session?.accessToken],
    queryFn: async () => {
      if (!session?.accessToken) throw new Error('No access token available');
      const stravaApi = new StravaAPI(session.accessToken);
      return stravaApi.getAthlete();
    },
    enabled: !!session?.accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes - athlete data doesn't change often
  });

  // Handle authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
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
      <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
            <p className="text-white/80 mb-6">
              {error instanceof Error ? error.message : 'Failed to load profile data'}
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

  if (!athlete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-white">No profile data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span>👤</span>
            My Profile
          </h1>
          <p className="text-white/70">
            Manage your personal information and account settings
          </p>
        </div>
        
        <ProfileDetails athlete={athlete} />
      </main>
    </div>
  );
}