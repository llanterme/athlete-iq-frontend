import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrainingPlanFormData, ExperienceLevel, TrainingTimePreference, DAYS_OF_WEEK } from '@/types/training-plan';

interface ConstraintsFormProps {
  data: Partial<TrainingPlanFormData>;
  onNext: (data: Partial<TrainingPlanFormData>) => void;
  onBack: () => void;
}

export function ConstraintsForm({ data, onNext, onBack }: ConstraintsFormProps) {
  const [formData, setFormData] = useState<Partial<TrainingPlanFormData>>({
    days_per_week: data.days_per_week || 4,
    max_hours_per_week: data.max_hours_per_week || 6,
    years_experience: data.years_experience || 'intermediate',
    preferred_training_days: data.preferred_training_days || [],
    preferred_rest_days: data.preferred_rest_days || ['Sunday'],
    preferred_training_time: data.preferred_training_time,
    upcoming_disruptions: data.upcoming_disruptions || [],
    injury_limitations: data.injury_limitations || []
  });

  const [newDisruption, setNewDisruption] = useState({
    start_date: '',
    end_date: '',
    description: ''
  });

  const [newInjury, setNewInjury] = useState('');

  const handleInputChange = (field: keyof TrainingPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string, field: 'preferred_training_days' | 'preferred_rest_days') => {
    const currentDays = formData[field] || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleInputChange(field, updatedDays);
  };

  const addDisruption = () => {
    if (newDisruption.start_date && newDisruption.end_date && newDisruption.description) {
      const disruptions = [...(formData.upcoming_disruptions || []), newDisruption];
      handleInputChange('upcoming_disruptions', disruptions);
      setNewDisruption({ start_date: '', end_date: '', description: '' });
    }
  };

  const removeDisruption = (index: number) => {
    const disruptions = (formData.upcoming_disruptions || []).filter((_, i) => i !== index);
    handleInputChange('upcoming_disruptions', disruptions);
  };

  const addInjury = () => {
    if (newInjury.trim()) {
      const injuries = [...(formData.injury_limitations || []), newInjury.trim()];
      handleInputChange('injury_limitations', injuries);
      setNewInjury('');
    }
  };

  const removeInjury = (index: number) => {
    const injuries = (formData.injury_limitations || []).filter((_, i) => i !== index);
    handleInputChange('injury_limitations', injuries);
  };

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Training Constraints & Schedule
        </h3>
        <p className="text-gray-600">
          Help us create a realistic training plan that fits your lifestyle and goals.
        </p>
      </div>

      {/* Basic Training Volume */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Training Volume</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days per week
            </label>
            <select
              value={formData.days_per_week}
              onChange={(e) => handleInputChange('days_per_week', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(days => (
                <option key={days} value={days}>
                  {days} day{days === 1 ? '' : 's'} per week
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max hours per week
            </label>
            <input
              type="number"
              min="0.5"
              max="30"
              step="0.5"
              value={formData.max_hours_per_week}
              onChange={(e) => handleInputChange('max_hours_per_week', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['beginner', 'intermediate', 'experienced'] as ExperienceLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleInputChange('years_experience', level)}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                  formData.years_experience === level
                    ? 'bg-tertiary-500 text-white border-tertiary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Schedule Preferences */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Schedule Preferences</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Training Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day, 'preferred_training_days')}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    (formData.preferred_training_days || []).includes(day)
                      ? 'bg-tertiary-500 text-white border-tertiary-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Optional: Leave blank for AI to decide</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Rest Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day, 'preferred_rest_days')}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    (formData.preferred_rest_days || []).includes(day)
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Training Time (Optional)
            </label>
            <select
              value={formData.preferred_training_time || ''}
              onChange={(e) => handleInputChange('preferred_training_time', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent"
            >
              <option value="">No preference</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Disruptions */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Upcoming Disruptions</h4>
        <p className="text-sm text-gray-600 mb-4">
          Add any known periods when you'll have limited training availability (vacations, work trips, etc.)
        </p>
        
        <div className="space-y-4">
          {(formData.upcoming_disruptions || []).map((disruption, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium text-gray-900">{disruption.description}</p>
                <p className="text-sm text-gray-600">
                  {disruption.start_date} to {disruption.end_date}
                </p>
              </div>
              <button
                onClick={() => removeDisruption(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="date"
              placeholder="Start date"
              value={newDisruption.start_date}
              onChange={(e) => setNewDisruption(prev => ({ ...prev, start_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent"
            />
            <input
              type="date"
              placeholder="End date"
              value={newDisruption.end_date}
              onChange={(e) => setNewDisruption(prev => ({ ...prev, end_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Description"
                value={newDisruption.description}
                onChange={(e) => setNewDisruption(prev => ({ ...prev, description: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent"
              />
              <Button
                onClick={addDisruption}
                disabled={!newDisruption.start_date || !newDisruption.end_date || !newDisruption.description}
                variant="secondary"
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Injury Limitations */}
      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Injury Limitations</h4>
        <p className="text-sm text-gray-600 mb-4">
          List any current injuries or physical limitations we should consider
        </p>
        
        <div className="space-y-3">
          {(formData.injury_limitations || []).map((injury, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-gray-900">{injury}</span>
              <button
                onClick={() => removeInjury(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., knee pain, achilles tendonitis"
              value={newInjury}
              onChange={(e) => setNewInjury(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInjury()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent"
            />
            <Button
              onClick={addInjury}
              disabled={!newInjury.trim()}
              variant="secondary"
              size="sm"
            >
              Add
            </Button>
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
          Back to Race Selection
        </Button>
        <Button
          onClick={handleNext}
          variant="primary"
          size="lg"
        >
          Continue to Equipment
        </Button>
      </div>
    </div>
  );
}