import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrainingPlanWithCountdown } from '@/types/training-plan';

interface DeletePlanModalProps {
  plan: TrainingPlanWithCountdown;
  isDeleting: boolean;
  error?: Error | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePlanModal({ plan, isDeleting, error, onConfirm, onCancel }: DeletePlanModalProps) {
  const raceDate = parseISO(plan.race_date);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Delete Training Plan?
            </h2>
            <p className="text-gray-600">
              This action cannot be undone. All your training plan data will be permanently removed.
            </p>
          </div>

          {/* Plan Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Race:</span>
                <span className="text-gray-700">{plan.race_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Date:</span>
                <span className="text-gray-700">{format(raceDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Duration:</span>
                <span className="text-gray-700">{plan.plan_duration_weeks} weeks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Volume:</span>
                <span className="text-gray-700">{Math.round(plan.total_training_hours)}h</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-red-400 text-lg mr-3">❌</div>
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Failed to delete training plan:</p>
                  <p className="text-red-700">{error.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-red-400 text-lg mr-3">🚨</div>
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">This will permanently delete:</p>
                <ul className="space-y-1 text-red-700">
                  <li>• All weekly training schedules</li>
                  <li>• Individual workout details</li>
                  <li>• Training phase progression</li>
                  <li>• AI-generated recommendations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="secondary"
              size="lg"
              className="flex-1 text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              variant="primary"
              size="lg"
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
              loading={isDeleting}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Plan'}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              You can always create a new training plan for this race later
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}