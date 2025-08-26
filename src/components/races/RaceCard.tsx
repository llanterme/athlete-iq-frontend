'use client';

import { useState } from 'react';
import { RaceWithCountdown, RACE_TYPE_ICONS } from '@/types/race';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { formatRaceDate, formatCountdown } from '@/lib/raceUtils';

interface RaceCardProps {
  race: RaceWithCountdown;
  onEdit: (race: RaceWithCountdown) => void;
  onDelete: (raceId: string) => void;
  isDeleting?: boolean;
}

export function RaceCard({ race, onEdit, onDelete, isDeleting = false }: RaceCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(race.id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getCountdownColor = () => {
    if (race.isPast) return 'text-gray-400';
    if (race.daysUntilRace <= 7) return 'text-red-400';
    if (race.daysUntilRace <= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getCardStyle = () => {
    if (race.isPast) return 'opacity-60';
    if (race.daysUntilRace <= 7) return 'ring-2 ring-red-400/50';
    return '';
  };

  return (
    <>
      <Card variant="interactive" className={`relative ${getCardStyle()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl" role="img" aria-label={race.race_type}>
                {RACE_TYPE_ICONS[race.race_type]}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {race.race_type}
                </h3>
                <p className="text-white/80 text-sm">
                  {formatRaceDate(race.race_date)}
                </p>
              </div>
            </div>
            
            <div className={`font-medium ${getCountdownColor()}`}>
              {formatCountdown(race.daysUntilRace)}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(race)}
              className="text-white/60 hover:text-white p-2"
              title="Edit race"
            >
              ✏️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-white/60 hover:text-white p-2"
              title="Delete race"
              disabled={isDeleting}
            >
              🗑️
            </Button>
          </div>
        </div>
        
        {race.daysUntilRace >= 0 && race.daysUntilRace <= 30 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-white/60">
              Race week preparation zone! 🎯
            </div>
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Race"
        message={`Are you sure you want to delete "${race.race_type}" scheduled for ${formatRaceDate(race.race_date)}? This action cannot be undone.`}
        confirmText="Delete Race"
        cancelText="Keep Race"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}