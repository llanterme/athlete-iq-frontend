import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface GenerationProgressProps {
  isGenerating: boolean;
  error?: string;
  onRetry: () => void;
}

const progressSteps = [
  { message: "Analyzing your fitness profile...", duration: 2000 },
  { message: "Selecting optimal race preparation strategy...", duration: 3000 },
  { message: "Creating periodized training phases...", duration: 4000 },
  { message: "Generating weekly workout schedules...", duration: 3000 },
  { message: "Optimizing workout intensity and volume...", duration: 2000 },
  { message: "Adding structured workout details...", duration: 2000 },
  { message: "Finalizing your personalized plan...", duration: 1000 }
];

export function GenerationProgress({ isGenerating, error, onRetry }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;

    let stepIndex = 0;
    let totalElapsed = 0;
    
    const advanceStep = () => {
      if (stepIndex < progressSteps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        
        setTimeout(advanceStep, progressSteps[stepIndex].duration);
      }
    };

    // Start with first step
    setCurrentStep(0);
    setTimeout(advanceStep, progressSteps[0].duration);

    // Update progress bar
    const progressInterval = setInterval(() => {
      totalElapsed += 100;
      const progressPercent = Math.min(95, (totalElapsed / 20000) * 100); // Cap at 95% until complete
      setProgress(progressPercent);
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating && !error) {
      // Complete the progress when generation is done
      setProgress(100);
      setCurrentStep(progressSteps.length - 1);
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
              {progressSteps[currentStep]?.message || "Processing..."}
            </p>
          </div>
        </Card>
      </div>

      {/* Steps Progress */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2">
          {progressSteps.map((step, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index <= currentStep 
                  ? 'bg-tertiary-500' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Estimated time: 10-30 seconds
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