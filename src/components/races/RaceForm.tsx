'use client';

import { useState, useEffect } from 'react';
import { RaceType, RACE_CATEGORIES, Race } from '@/types/race';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface RaceFormProps {
  race?: Race;
  onSubmit: (data: { race_type: RaceType; race_date: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function RaceForm({ race, onSubmit, onCancel, isSubmitting = false, error }: RaceFormProps) {
  const [raceType, setRaceType] = useState<RaceType | ''>('');
  const [raceDate, setRaceDate] = useState('');
  const [errors, setErrors] = useState<{ raceType?: string; raceDate?: string }>({});

  useEffect(() => {
    if (race) {
      setRaceType(race.race_type);
      setRaceDate(race.race_date);
    }
  }, [race]);

  const validateForm = (): boolean => {
    const newErrors: { raceType?: string; raceDate?: string } = {};

    if (!raceType) {
      newErrors.raceType = 'Please select a race type';
    }

    if (!raceDate) {
      newErrors.raceDate = 'Please select a race date';
    } else {
      const selectedDate = new Date(raceDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.raceDate = 'Race date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && raceType) {
      onSubmit({
        race_type: raceType,
        race_date: raceDate
      });
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card variant="default" className="w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">
            {race ? 'Edit Race' : 'Add New Race'}
          </h2>
          <p className="text-white/70 text-sm">
            {race ? 'Update your race details' : 'Plan your upcoming race'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Race Type
            </label>
            <select
              value={raceType}
              onChange={(e) => setRaceType(e.target.value as RaceType)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent backdrop-blur-sm"
            >
              <option value="" className="bg-gray-800">Select a race type...</option>
              
              <optgroup label="🏃 Running" className="bg-gray-800">
                {RACE_CATEGORIES.Running.map((type) => (
                  <option key={type} value={type} className="bg-gray-800">
                    {type}
                  </option>
                ))}
              </optgroup>
              
              <optgroup label="🏊‍♂️🚴‍♂️🏃‍♂️ Triathlon" className="bg-gray-800">
                {RACE_CATEGORIES.Triathlon.map((type) => (
                  <option key={type} value={type} className="bg-gray-800">
                    {type}
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.raceType && (
              <p className="text-red-400 text-sm mt-1">{errors.raceType}</p>
            )}
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Race Date
            </label>
            <input
              type="date"
              value={raceDate}
              min={getTomorrowDate()}
              onChange={(e) => setRaceDate(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:border-transparent backdrop-blur-sm"
            />
            {errors.raceDate && (
              <p className="text-red-400 text-sm mt-1">{errors.raceDate}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="flex-1"
            >
              {race ? 'Update Race' : 'Add Race'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}