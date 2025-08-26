import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrainingPlanFormData, EquipmentType, EQUIPMENT_OPTIONS } from '@/types/training-plan';

interface EquipmentPreferencesProps {
  data: Partial<TrainingPlanFormData>;
  onNext: (data: Partial<TrainingPlanFormData>) => void;
  onBack: () => void;
}

export function EquipmentPreferences({ data, onNext, onBack }: EquipmentPreferencesProps) {
  const [formData, setFormData] = useState<Partial<TrainingPlanFormData>>({
    available_equipment: data.available_equipment || [],
    safe_outdoor_routes: data.safe_outdoor_routes ?? true,
    include_strength_training: data.include_strength_training ?? true,
    include_cross_training: data.include_cross_training ?? false
  });

  const handleEquipmentToggle = (equipment: EquipmentType) => {
    const currentEquipment = formData.available_equipment || [];
    const updatedEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter(e => e !== equipment)
      : [...currentEquipment, equipment];
    
    setFormData(prev => ({ ...prev, available_equipment: updatedEquipment }));
  };

  const handleInputChange = (field: keyof TrainingPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const equipmentCategories = {
    'Indoor Training': ['bike_trainer', 'treadmill'] as EquipmentType[],
    'Monitoring Devices': ['heart_rate_monitor', 'power_meter', 'gps_watch'] as EquipmentType[],
    'Facilities': ['pool_access', 'gym_access', 'strength_equipment'] as EquipmentType[]
  };

  return (
    <div className="space-y-6 training-plan-form">
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          Equipment & Preferences
        </h3>
        <p className="text-gray-400">
          Tell us about your available equipment and training preferences to create the most suitable plan.
        </p>
      </div>

      {/* Available Equipment */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-200 mb-4">Available Equipment</h4>
        <p className="text-sm text-gray-400 mb-4">
          Select all equipment you have access to. This helps us tailor workouts to your setup.
        </p>
        
        <div className="space-y-6">
          {Object.entries(equipmentCategories).map(([category, equipmentList]) => (
            <div key={category}>
              <h5 className="text-sm font-medium text-gray-300 mb-3">{category}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {equipmentList.map((equipment) => (
                  <label
                    key={equipment}
                    className="flex items-center p-3 border border-navy-600 rounded-lg cursor-pointer hover:bg-navy-700/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(formData.available_equipment || []).includes(equipment)}
                      onChange={() => handleEquipmentToggle(equipment)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 transition-colors ${
                      (formData.available_equipment || []).includes(equipment)
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-navy-600'
                    }`}>
                      {(formData.available_equipment || []).includes(equipment) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-200">{EQUIPMENT_OPTIONS[equipment]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Environment & Safety */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-200 mb-4">Training Environment</h4>
        
        <div className="space-y-4">
          <label className="flex items-center p-3 border border-navy-600 rounded-lg cursor-pointer hover:bg-navy-700/30 transition-colors">
            <input
              type="checkbox"
              checked={formData.safe_outdoor_routes}
              onChange={(e) => handleInputChange('safe_outdoor_routes', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 transition-colors ${
              formData.safe_outdoor_routes
                ? 'bg-orange-500 border-orange-500'
                : 'border-navy-600'
            }`}>
              {formData.safe_outdoor_routes && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-gray-200 font-medium">Safe outdoor training routes available</span>
              <p className="text-sm text-gray-400">I have access to safe roads, trails, or paths for outdoor training</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Training Preferences */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-200 mb-4">Training Preferences</h4>
        
        <div className="space-y-4">
          <label className="flex items-center p-3 border border-navy-600 rounded-lg cursor-pointer hover:bg-navy-700/30 transition-colors">
            <input
              type="checkbox"
              checked={formData.include_strength_training}
              onChange={(e) => handleInputChange('include_strength_training', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 transition-colors ${
              formData.include_strength_training
                ? 'bg-orange-500 border-orange-500'
                : 'border-navy-600'
            }`}>
              {formData.include_strength_training && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-gray-200 font-medium">Include strength training</span>
              <p className="text-sm text-gray-400">Add dedicated strength/resistance training sessions to complement your sport-specific training</p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-navy-600 rounded-lg cursor-pointer hover:bg-navy-700/30 transition-colors">
            <input
              type="checkbox"
              checked={formData.include_cross_training}
              onChange={(e) => handleInputChange('include_cross_training', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 transition-colors ${
              formData.include_cross_training
                ? 'bg-orange-500 border-orange-500'
                : 'border-navy-600'
            }`}>
              {formData.include_cross_training && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-gray-200 font-medium">Include cross-training activities</span>
              <p className="text-sm text-gray-400">Add variety with activities like yoga, swimming, or other sports to prevent overuse injuries</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-blue-950/20 border-blue-900/50">
        <div className="flex items-start">
          <div className="text-blue-400 text-lg mr-3">💡</div>
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-2">AI Training Plan Generation</p>
            <p className="text-blue-400 mb-2">
              Based on your inputs, our AI will create a personalized training plan that:
            </p>
            <ul className="space-y-1 text-blue-400">
              <li>• Adapts to your available equipment and schedule</li>
              <li>• Progressively builds fitness toward your race date</li>
              <li>• Accounts for your experience level and constraints</li>
              <li>• Includes periodization with base, build, peak, and taper phases</li>
              <li>• Provides detailed workout instructions and target metrics</li>
            </ul>
            <p className="text-blue-400 mt-3 text-xs">
              Generation typically takes 10-30 seconds depending on plan complexity
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="ghost"
          size="lg"
        >
          Back to Constraints
        </Button>
        <Button
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          🤖 Generate Training Plan
        </Button>
      </div>
    </div>
  );
}