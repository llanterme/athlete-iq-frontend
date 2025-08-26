import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RaceSelectionStep } from './RaceSelectionStep';
import { ConstraintsForm } from './ConstraintsForm';
import { EquipmentPreferences } from './EquipmentPreferences';
import { GenerationProgress } from './GenerationProgress';
import { apiClient } from '@/lib/api';
import { TrainingPlanFormData, TrainingPlanRequest } from '@/types/training-plan';
import { validateTrainingPlanForm } from '@/lib/training-plan-utils';

interface TrainingPlanFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

type FormStep = 'race-selection' | 'constraints' | 'equipment' | 'generating';

export function TrainingPlanForm({ onClose, onSuccess }: TrainingPlanFormProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<FormStep>('race-selection');
  const [formData, setFormData] = useState<Partial<TrainingPlanFormData>>({
    days_per_week: 4,
    max_hours_per_week: 6,
    years_experience: 'intermediate',
    preferred_training_days: [],
    preferred_rest_days: ['Sunday'],
    upcoming_disruptions: [],
    injury_limitations: [],
    available_equipment: [],
    safe_outdoor_routes: true,
    include_strength_training: true,
    include_cross_training: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [pollTimeoutId, setPollTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const userId = session?.user?.id;

  // Handle Escape key press and cleanup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep !== 'generating') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Cleanup polling on unmount
      if (pollTimeoutId) {
        clearTimeout(pollTimeoutId);
      }
    };
  }, [onClose, currentStep, pollTimeoutId]);

  // Fetch user races for race selection
  const { data: races, isLoading: racesLoading } = useQuery({
    queryKey: ['races', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        return await apiClient.getUserRaces(userId);
      } catch (err) {
        return [];
      }
    },
    enabled: !!userId && currentStep === 'race-selection',
  });

  const generatePlanMutation = useMutation({
    mutationFn: async (request: TrainingPlanRequest) => {
      const jobResponse = await apiClient.generateTrainingPlan(request);
      setJobId(jobResponse.job_id);
      return jobResponse;
    },
    onSuccess: async (jobResponse) => {
      // Start polling for job status
      pollJobStatus(jobResponse.job_id);
    },
    onError: (error: Error) => {
      setErrors([error.message]);
      setCurrentStep('equipment'); // Go back to last step
      setJobId(null);
      setJobStatus(null);
    },
  });

  const pollJobStatus = async (jobId: string) => {
    if (!userId) return;

    const pollInterval = 2000; // Poll every 2 seconds
    const maxPolls = 60; // Max 2 minutes
    let polls = 0;

    const poll = async () => {
      try {
        const status = await apiClient.getTrainingPlanJobStatus(jobId, userId);
        setJobStatus(status.status);

        if (status.status === 'completed' && status.result_plan_id) {
          // Job completed successfully
          queryClient.invalidateQueries({ queryKey: ['training-plans', userId] });
          onSuccess();
          return;
        }

        if (status.status === 'failed') {
          setErrors([status.error_message || 'Training plan generation failed']);
          setCurrentStep('equipment');
          setJobId(null);
          setJobStatus(null);
          return;
        }

        if (status.status === 'cancelled') {
          setErrors(['Training plan generation was cancelled']);
          setCurrentStep('equipment');
          setJobId(null);
          setJobStatus(null);
          return;
        }

        // Continue polling if still processing
        if ((status.status === 'pending' || status.status === 'processing') && polls < maxPolls) {
          polls++;
          const timeoutId = setTimeout(poll, pollInterval);
          setPollTimeoutId(timeoutId);
        } else if (polls >= maxPolls) {
          setErrors(['Training plan generation timed out. Please try again.']);
          setCurrentStep('equipment');
          setJobId(null);
          setJobStatus(null);
          setPollTimeoutId(null);
        }
      } catch (error) {
        setErrors(['Failed to check job status. Please try again.']);
        setCurrentStep('equipment');
        setJobId(null);
        setJobStatus(null);
      }
    };

    // Start polling
    poll();
  };

  const handleStepComplete = (stepData: Partial<TrainingPlanFormData>) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);
    setErrors([]);

    switch (currentStep) {
      case 'race-selection':
        setCurrentStep('constraints');
        break;
      case 'constraints':
        setCurrentStep('equipment');
        break;
      case 'equipment':
        // Validate form and generate plan
        const validationErrors = validateTrainingPlanForm(updatedData);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }
        generatePlan(updatedData as TrainingPlanFormData);
        break;
    }
  };

  const generatePlan = (data: TrainingPlanFormData) => {
    if (!userId) return;

    setCurrentStep('generating');
    
    const request: TrainingPlanRequest = {
      user_id: userId,
      race_id: data.race_id,
      days_per_week: data.days_per_week,
      max_hours_per_week: data.max_hours_per_week,
      years_experience: data.years_experience,
      preferred_training_days: data.preferred_training_days.length > 0 ? data.preferred_training_days : undefined,
      preferred_rest_days: data.preferred_rest_days.length > 0 ? data.preferred_rest_days : undefined,
      preferred_training_time: data.preferred_training_time,
      upcoming_disruptions: data.upcoming_disruptions.length > 0 ? data.upcoming_disruptions : undefined,
      injury_limitations: data.injury_limitations.length > 0 ? data.injury_limitations : undefined,
      available_equipment: data.available_equipment.length > 0 ? data.available_equipment : undefined,
      safe_outdoor_routes: data.safe_outdoor_routes,
      include_strength_training: data.include_strength_training,
      include_cross_training: data.include_cross_training
    };

    generatePlanMutation.mutate(request);
  };

  const handleBack = () => {
    setErrors([]);
    switch (currentStep) {
      case 'constraints':
        setCurrentStep('race-selection');
        break;
      case 'equipment':
        setCurrentStep('constraints');
        break;
    }
  };

  const steps = [
    { id: 'race-selection', label: 'Select Race', icon: '🏁' },
    { id: 'constraints', label: 'Training Setup', icon: '⚙️' },
    { id: 'equipment', label: 'Equipment & Preferences', icon: '🏋️‍♂️' },
    { id: 'generating', label: 'Generating Plan', icon: '🤖' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={async (e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          if (currentStep === 'generating' && jobId && userId) {
            try {
              await apiClient.cancelTrainingPlanJob(jobId, userId);
            } catch (err) {
              // Silently fail - we're closing anyway
            }
          }
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-navy-900/95 border border-navy-700 training-plan-form">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                Create Training Plan
              </h2>
              <p className="text-gray-400 mt-1">
                Let AI generate a personalized training plan for your race
              </p>
            </div>
            <Button
              variant="ghost"
              size="lg"
              onClick={async () => {
                // Cancel job if in progress
                if (currentStep === 'generating' && jobId && userId) {
                  try {
                    await apiClient.cancelTrainingPlanJob(jobId, userId);
                  } catch (err) {
                    // Silently fail - we're closing anyway
                  }
                }
                onClose();
              }}
              className="text-gray-400 hover:text-gray-200 hover:bg-navy-800 rounded-full w-10 h-10 flex items-center justify-center p-0"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-gray-600 text-gray-500'
                  }`}>
                    <span className="text-sm">{step.icon}</span>
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      index <= currentStepIndex ? 'text-orange-400' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-12 h-px mx-4 ${
                      index < currentStepIndex ? 'bg-orange-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
              <div className="flex items-start">
                <div className="text-red-400 text-xl mr-3">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-red-400 font-medium mb-2">Please fix the following errors:</h3>
                  <ul className="text-red-300 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 'race-selection' && (
              <RaceSelectionStep
                races={races || []}
                loading={racesLoading}
                selectedRaceId={formData.race_id}
                onNext={handleStepComplete}
              />
            )}

            {currentStep === 'constraints' && (
              <ConstraintsForm
                data={formData}
                onNext={handleStepComplete}
                onBack={handleBack}
              />
            )}

            {currentStep === 'equipment' && (
              <EquipmentPreferences
                data={formData}
                onNext={handleStepComplete}
                onBack={handleBack}
              />
            )}

            {currentStep === 'generating' && (
              <GenerationProgress
                isGenerating={generatePlanMutation.isPending || jobStatus === 'pending' || jobStatus === 'processing'}
                jobId={jobId}
                userId={userId}
                error={generatePlanMutation.error?.message}
                onRetry={() => {
                  if (formData.race_id) {
                    generatePlan(formData as TrainingPlanFormData);
                  }
                }}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}