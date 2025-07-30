'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/dashboard/Navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrainingPlanCard } from '@/components/training-plan/TrainingPlanCard';
import { TrainingPlanForm } from '@/components/training-plan/TrainingPlanForm';
import { apiClient } from '@/lib/api';
import { 
  addCountdownToTrainingPlans, 
  sortTrainingPlansByRaceDate, 
  getActiveTrainingPlans 
} from '@/lib/training-plan-utils';
import { TrainingPlanWithCountdown } from '@/types/training-plan';

export default function TrainingPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [showForm, setShowForm] = useState(false);
  const [showPastPlans, setShowPastPlans] = useState(false);

  const userId = session?.user?.id;

  const { data: trainingPlans, isLoading, error } = useQuery({
    queryKey: ['training-plans', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        const response = await apiClient.getUserTrainingPlans(userId);
        const plansWithCountdown = addCountdownToTrainingPlans(response.plans.map(summary => ({
          ...summary,
          user_id: userId,
          // Mock full plan data for summary - in real implementation this would be minimal
          phases: [],
          weekly_plans: [],
          years_experience: 'intermediate' as const,
          days_per_week: 0,
          max_hours_per_week: 0,
          total_tss: 0,
          peak_week_hours: 0,
          taper_duration_days: 0,
          plan_rationale: '',
          key_workouts_explanation: '',
          periodization_strategy: '',
          assumptions_made: [],
          warnings: [],
          race_priority: 'A' as const,
          plan_start_date: summary.race_date // Placeholder
        })));
        return plansWithCountdown;
      } catch (err) {
        console.warn('Failed to fetch training plans:', err);
        return [];
      }
    },
    enabled: !!userId,
    retry: 1,
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedPlans = trainingPlans ? sortTrainingPlansByRaceDate(trainingPlans) : [];
  const activePlans = getActiveTrainingPlans(sortedPlans);
  const pastPlans = sortedPlans.filter(plan => plan.isPast);
  const displayedPlans = showPastPlans ? sortedPlans : activePlans;

  const handleCreatePlan = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handlePlanClick = (planId: string) => {
    router.push(`/training-plan/${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🎯 Training Plans
              </h1>
              <p className="text-white/70">
                AI-powered personalized training plans for your races
              </p>
            </div>
            <Button
              onClick={handleCreatePlan}
              variant="primary"
              size="lg"
              className="shadow-lg w-full sm:w-auto"
            >
              ✨ Generate Plan
            </Button>
          </div>

          {/* Stats */}
          {trainingPlans && trainingPlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card glass>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {activePlans.length}
                  </div>
                  <div className="text-white/70 text-sm">Active Plans</div>
                </div>
              </Card>
              <Card glass>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {pastPlans.length}
                  </div>
                  <div className="text-white/70 text-sm">Completed Plans</div>
                </div>
              </Card>
              <Card glass>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {activePlans.length > 0 ? activePlans[0].daysUntilRace : '—'}
                  </div>
                  <div className="text-white/70 text-sm">Days to Next Race</div>
                </div>
              </Card>
            </div>
          )}

          {/* Toggle Past Plans */}
          {pastPlans.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPastPlans(!showPastPlans)}
                className="text-white/70 hover:text-white"
              >
                {showPastPlans ? 'Hide Past Plans' : `Show Past Plans (${pastPlans.length})`}
              </Button>
            </div>
          )}

          {/* Training Plans Grid */}
          {displayedPlans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedPlans.map((plan) => (
                <TrainingPlanCard
                  key={plan.plan_id}
                  plan={plan}
                  onClick={() => handlePlanClick(plan.plan_id)}
                />
              ))}
            </div>
          ) : (
            <Card glass className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-white mb-2">
                {showPastPlans ? 'No past plans' : 'No active training plans'}
              </h2>
              <p className="text-white/70 mb-6">
                {showPastPlans 
                  ? 'Your completed training plans will appear here'
                  : 'Create your first AI-powered training plan to start structured training!'
                }
              </p>
              {!showPastPlans && (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-center gap-3 text-white/60">
                      <span className="flex items-center gap-1">
                        🏁 Choose your race
                      </span>
                      <span className="text-white/40">→</span>
                      <span className="flex items-center gap-1">
                        ⚙️ Set constraints
                      </span>
                      <span className="text-white/40">→</span>
                      <span className="flex items-center gap-1">
                        🤖 AI generates plan
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreatePlan}
                    variant="primary"
                    size="lg"
                  >
                    ✨ Generate Your First Plan
                  </Button>
                </>
              )}
            </Card>
          )}
        </div>
      </main>

      {/* Training Plan Form Modal */}
      {showForm && (
        <TrainingPlanForm
          onClose={handleFormClose}
          onSuccess={() => {
            setShowForm(false);
            // Refresh plans list
            // queryClient.invalidateQueries(['training-plans', userId]);
          }}
        />
      )}
    </div>
  );
}