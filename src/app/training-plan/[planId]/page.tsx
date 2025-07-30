'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/dashboard/Navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PlanHeader } from '@/components/training-plan/PlanHeader';
import { PhaseTimeline } from '@/components/training-plan/PhaseTimeline';
import { WeeklyView } from '@/components/training-plan/WeeklyView';
import { apiClient } from '@/lib/api';
import { addCountdownToTrainingPlans, generateWeekOptions } from '@/lib/training-plan-utils';

export default function TrainingPlanDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const planId = params.planId as string;
  
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const userId = session?.user?.id;

  const { data: plan, isLoading, error } = useQuery({
    queryKey: ['training-plan', userId, planId],
    queryFn: async () => {
      if (!userId || !planId) return null;
      try {
        const planData = await apiClient.getTrainingPlanDetails(userId, planId);
        const [planWithCountdown] = addCountdownToTrainingPlans([planData]);
        return planWithCountdown;
      } catch (err) {
        console.error('Failed to fetch training plan:', err);
        throw err;
      }
    },
    enabled: !!userId && !!planId,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/10 rounded-xl"></div>
            <div className="h-20 bg-white/10 rounded-xl"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-24 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Training Plan Not Found</h2>
            <p className="text-white/80 mb-6">
              {error instanceof Error ? error.message : 'The requested training plan could not be found'}
            </p>
            <Button
              onClick={() => router.push('/training-plan')}
              variant="primary"
            >
              Back to Training Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const weekOptions = generateWeekOptions(plan);
  const currentWeekOption = weekOptions.find(w => w.weekNumber === selectedWeek);

  // Set initial selected week to current week if available
  if (selectedWeek === 1 && plan.currentWeek && plan.currentWeek > 1) {
    setSelectedWeek(plan.currentWeek);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-strava-orange via-primary-600 to-primary-800">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Back Navigation */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/training-plan')}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white"
            >
              ← Back to Plans
            </Button>
          </div>

          {/* Plan Header */}
          <PlanHeader plan={plan} />

          {/* Phase Timeline */}
          <PhaseTimeline 
            phases={plan.phases} 
            currentWeek={plan.currentWeek}
            totalWeeks={plan.plan_duration_weeks}
          />

          {/* Week Navigation */}
          <Card glass className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Week {selectedWeek} of {plan.plan_duration_weeks}
                </h3>
                {currentWeekOption && (
                  <p className="text-white/70 text-sm">
                    {currentWeekOption.dateRange}
                    {currentWeekOption.phase && (
                      <span className="ml-2 px-2 py-1 bg-white/10 rounded-full text-xs capitalize">
                        {currentWeekOption.phase} phase
                      </span>
                    )}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                  disabled={selectedWeek === 1}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white"
                >
                  ← Previous
                </Button>
                
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-tertiary-500"
                >
                  {weekOptions.map((week) => (
                    <option key={week.weekNumber} value={week.weekNumber} className="bg-gray-800">
                      Week {week.weekNumber}
                      {week.isCurrentWeek ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
                
                <Button
                  onClick={() => setSelectedWeek(Math.min(plan.plan_duration_weeks, selectedWeek + 1))}
                  disabled={selectedWeek === plan.plan_duration_weeks}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white"
                >
                  Next →
                </Button>
              </div>
            </div>
          </Card>

          {/* Weekly View */}
          <WeeklyView 
            plan={plan}
            selectedWeek={selectedWeek}
          />

          {/* Plan Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card glass className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                📋 Plan Rationale
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {plan.plan_rationale}
              </p>
            </Card>

            <Card glass className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                🎯 Key Workouts
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {plan.key_workouts_explanation}
              </p>
            </Card>

            <Card glass className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                📈 Periodization Strategy
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {plan.periodization_strategy}
              </p>
            </Card>

            <Card glass className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                💡 Assumptions & Warnings
              </h3>
              <div className="space-y-3 text-sm">
                {plan.assumptions_made.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Assumptions:</h4>
                    <ul className="text-white/70 space-y-1">
                      {plan.assumptions_made.map((assumption, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-white/50">•</span>
                          <span>{assumption}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {plan.warnings.length > 0 && (
                  <div>
                    <h4 className="text-yellow-300 font-medium mb-2">Warnings:</h4>
                    <ul className="text-yellow-200 space-y-1">
                      {plan.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-400">⚠</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}