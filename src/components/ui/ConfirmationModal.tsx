'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '❗';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'info':
        return 'bg-tertiary-500 hover:bg-tertiary-600';
      default:
        return 'bg-tertiary-500 hover:bg-tertiary-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card glass className="w-full max-w-md">
        <div className="text-center">
          <div className="text-4xl mb-4">
            {getIcon()}
          </div>
          
          <h2 className="text-xl font-bold text-white mb-3">
            {title}
          </h2>
          
          <p className="text-white/80 mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            
            <Button
              onClick={onConfirm}
              loading={isLoading}
              className={`flex-1 text-white ${getConfirmButtonClass()}`}
              disabled={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}