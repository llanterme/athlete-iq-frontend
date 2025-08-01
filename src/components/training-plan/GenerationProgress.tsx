import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiClient, TrainingPlanJobStatus } from '@/lib/api';

interface GenerationProgressProps {
  isGenerating: boolean;
  jobId: string | null;
  userId: string | undefined;
  error?: string;
  onRetry: () => void;
}

// Progress messages mapped to progress ranges
const getProgressMessage = (progress: number): string => {
  if (progress === 0) return "Starting training plan generation...";
  if (progress < 10) return "Starting training plan generation...";
  if (progress < 40) return "Race entry validated...";
  if (progress < 50) return "Fitness data and training history analyzed...";
  if (progress < 55) return "Training context prepared, consulting AI coach...";
  if (progress < 90) return "Generating personalized training plan...";
  if (progress < 95) return "AI training plan received, structuring...";
  if (progress < 100) return "Training plan structured, saving to database...";
  return "Training plan completed successfully!";
};

export function GenerationProgress({ isGenerating, jobId, userId, error, onRetry }: GenerationProgressProps) {
  const [jobStatus, setJobStatus] = useState<TrainingPlanJobStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("Starting training plan generation...");

  // Poll job status when we have a jobId
  useEffect(() => {
    if (!isGenerating || !jobId || !userId) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await apiClient.getTrainingPlanJobStatus(jobId, userId);
        setJobStatus(status);
        setProgress(status.progress);
        setCurrentMessage(status.current_step || getProgressMessage(status.progress));
      } catch (err) {
        // Silently handle polling errors - the parent component will handle retries
      }
    }, 1000); // Poll every second for smoother progress updates

    return () => {
      clearInterval(pollInterval);
    };
  }, [isGenerating, jobId, userId]);

  useEffect(() => {
    if (!isGenerating && !error) {
      // Complete the progress when generation is done
      setProgress(100);
      setCurrentMessage("Training plan completed successfully!");
    }
  }, [isGenerating, error]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generation Failed
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {error}
        </p>
        <div className="space-y-3">
          <Button
            onClick={onRetry}
            variant="primary"
            size="lg"
          >
            🔄 Try Again
          </Button>
          <p className="text-xs text-gray-500">
            If the problem persists, try adjusting your constraints or check your internet connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="mb-8">
        {/* Animated AI Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-tertiary-400 to-tertiary-600 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <span className="text-2xl animate-bounce">🤖</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Generating Your Training Plan
        </h3>
        <p className="text-gray-600 mb-6">
          Our AI is creating a personalized plan tailored to your goals and constraints
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-tertiary-500 to-tertiary-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-tertiary-50 border-tertiary-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-tertiary-600 mr-3"></div>
            <p className="text-tertiary-800 font-medium">
              {currentMessage}
            </p>
          </div>
        </Card>
      </div>

      {/* Job Details (for debugging - can be removed in production) */}
      {jobStatus && process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Job ID: {jobId}</p>
          <p>Status: {jobStatus.status}</p>
          {jobStatus.retry_count > 0 && <p>Retry: {jobStatus.retry_count}</p>}
        </div>
      )}

      {/* Estimated Time */}
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          {jobStatus?.estimated_completion 
            ? `Estimated completion: ${new Date(jobStatus.estimated_completion).toLocaleTimeString()}`
            : 'Estimated time: 30-60 seconds'
          }
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Complex plans may take longer to optimize
        </p>
      </div>

      {/* Tips while waiting */}
      <div className="mt-8 max-w-lg mx-auto">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">💡 Did you know?</h4>
          <p className="text-sm text-blue-800">
            Your training plan will include structured workouts with specific intensity zones, 
            rest periods, and progressive overload to maximize your race performance while 
            minimizing injury risk.
          </p>
        </Card>
      </div>
    </div>
  );
}