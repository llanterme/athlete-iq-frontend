'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/dashboard/Navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RaceCard } from '@/components/races/RaceCard';
import { RaceForm } from '@/components/races/RaceForm';
import { apiClient } from '@/lib/api';
import { RaceWithCountdown, Race, RaceType } from '@/types/race';
import { addCountdownToRaces, sortRacesByDate, getUpcomingRaces } from '@/lib/raceUtils';

export default function RacesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [showPastRaces, setShowPastRaces] = useState(false);

  const userId = session?.user?.id;

  const { data: races, isLoading, error } = useQuery({
    queryKey: ['races', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        const racesData = await apiClient.getUserRaces(userId);
        console.log('Raw API response:', racesData);
        const processedRaces = addCountdownToRaces(racesData);
        console.log('Processed races:', processedRaces);
        return processedRaces;
      } catch (err) {
        // If the API returns 404 or races don't exist yet, return empty array
        console.warn('Failed to fetch races:', err);
        return [];
      }
    },
    enabled: !!userId,
    retry: 1, // Only retry once
  });

  const createRaceMutation = useMutation({
    mutationFn: async (data: { race_type: RaceType; race_date: string }) => {
      if (!userId) throw new Error('User not authenticated');
      try {
        const result = await apiClient.createRace({
          user_id: userId,
          race_type: data.race_type,
          race_date: data.race_date,
        });
        console.log('Create race result:', result);
        return result;
      } catch (err) {
        console.error('Failed to create race:', err);
        throw err; // Re-throw the original error for now to see what's happening
      }
    },
    onSuccess: (data) => {
      console.log('Race created successfully:', data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['races', userId] });
      queryClient.invalidateQueries({ queryKey: ['races'] }); // Also invalidate widget cache
      setShowForm(false);
    },
    onError: (error: Error) => {
      // Keep the form open so user can see the error
      console.error('Create race error:', error);
    },
  });

  const updateRaceMutation = useMutation({
    mutationFn: async (data: { raceId: string; race_type: RaceType; race_date: string }) => {
      if (!userId) throw new Error('User not authenticated');
      return apiClient.updateRace(userId, data.raceId, {
        race_type: data.race_type,
        race_date: data.race_date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races', userId] });
      setEditingRace(null);
      setShowForm(false);
    },
  });

  const deleteRaceMutation = useMutation({
    mutationFn: async (raceId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return apiClient.deleteRace(userId, raceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races', userId] });
    },
  });

  const handleAddRace = () => {
    setEditingRace(null);
    createRaceMutation.reset();
    updateRaceMutation.reset();
    setShowForm(true);
  };

  const handleEditRace = (race: RaceWithCountdown) => {
    setEditingRace(race);
    createRaceMutation.reset();
    updateRaceMutation.reset();
    setShowForm(true);
  };

  const handleDeleteRace = (raceId: string) => {
    deleteRaceMutation.mutate(raceId);
  };

  const handleFormSubmit = (data: { race_type: RaceType; race_date: string }) => {
    if (editingRace) {
      updateRaceMutation.mutate({
        raceId: editingRace.id,
        ...data,
      });
    } else {
      createRaceMutation.mutate(data);
    }
  };

  const handleFormCancel = () => {
    createRaceMutation.reset();
    updateRaceMutation.reset();
    setShowForm(false);
    setEditingRace(null);
  };

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedRaces = races ? sortRacesByDate(races) : [];
  const upcomingRaces = getUpcomingRaces(sortedRaces);
  const pastRaces = sortedRaces.filter(race => race.isPast);
  const displayedRaces = showPastRaces ? sortedRaces : upcomingRaces;

  return (
    <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🏁 Race Calendar
              </h1>
              <p className="text-white/70">
                Plan and track your upcoming races
              </p>
            </div>
            <Button
              onClick={handleAddRace}
              variant="primary"
              size="lg"
              className="shadow-lg"
            >
              ➕ Add Race
            </Button>
          </div>

          {/* Stats */}
          {races && races.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card glass>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {upcomingRaces.length}
                  </div>
                  <div className="text-white/70 text-sm">Upcoming Races</div>
                </div>
              </Card>
              <Card glass>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {pastRaces.length}
                  </div>
                  <div className="text-white/70 text-sm">Completed Races</div>
                </div>
              </Card>
              <Card glass>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {upcomingRaces.length > 0 ? upcomingRaces[0].daysUntilRace : '—'}
                  </div>
                  <div className="text-white/70 text-sm">Days to Next Race</div>
                </div>
              </Card>
            </div>
          )}

          {/* Toggle Past Races */}
          {pastRaces.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPastRaces(!showPastRaces)}
                className="text-white/70 hover:text-white"
              >
                {showPastRaces ? 'Hide Past Races' : `Show Past Races (${pastRaces.length})`}
              </Button>
            </div>
          )}

          {/* Races Grid */}
          {displayedRaces.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedRaces.map((race) => (
                <RaceCard
                  key={race.id}
                  race={race}
                  onEdit={handleEditRace}
                  onDelete={handleDeleteRace}
                  isDeleting={deleteRaceMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <Card glass className="text-center py-12">
              <div className="text-6xl mb-4">🏁</div>
              <h2 className="text-xl font-bold text-white mb-2">
                {showPastRaces ? 'No past races' : 'No upcoming races'}
              </h2>
              <p className="text-white/70 mb-2">
                {showPastRaces 
                  ? 'Your completed races will appear here'
                  : 'Add your next race to start planning your training!'
                }
              </p>
              <p className="text-white/50 text-sm mb-6">
                Note: Race planning is currently in development. Backend persistence coming soon!
              </p>
              {!showPastRaces && (
                <Button
                  onClick={handleAddRace}
                  variant="primary"
                >
                  ➕ Add Your First Race
                </Button>
              )}
            </Card>
          )}
        </div>
      </main>

      {/* Race Form Modal */}
      {showForm && (
        <RaceForm
          race={editingRace || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={createRaceMutation.isPending || updateRaceMutation.isPending}
          error={createRaceMutation.error?.message || updateRaceMutation.error?.message || null}
        />
      )}
    </div>
  );
}