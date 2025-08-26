'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info' | 'success';
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

  const getIconAndStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.734-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          background: 'bg-gradient-to-br from-fitness-red-500 to-fitness-red-600',
          buttonVariant: 'danger' as const
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          background: 'bg-gradient-to-br from-fitness-amber-500 to-fitness-amber-600',
          buttonVariant: 'primary' as const
        };
      case 'info':
        return {
          icon: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          background: 'bg-gradient-to-br from-fitness-blue-500 to-fitness-blue-600',
          buttonVariant: 'primary' as const
        };
      case 'success':
        return {
          icon: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          background: 'bg-gradient-to-br from-fitness-green-500 to-fitness-green-600',
          buttonVariant: 'success' as const
        };
      default:
        return {
          icon: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          background: 'bg-gradient-to-br from-fitness-navy-600 to-fitness-navy-700',
          buttonVariant: 'primary' as const
        };
    }
  };

  const { icon, background, buttonVariant } = getIconAndStyles();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && !isLoading) {
      onConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-fitness-navy-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Card 
        variant="interactive" 
        className="w-full max-w-md transform animate-scale-in"
        padding="lg"
      >
        <div className="text-center">
          {/* Icon */}
          <div className={clsx(
            'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6',
            background
          )}>
            {icon}
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-fitness-navy-300 mb-8 leading-relaxed text-sm">
            {message}
          </p>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {cancelText}
            </Button>
            
            <Button
              variant={buttonVariant}
              onClick={onConfirm}
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}