import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, glass = false, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl p-6 transition-all duration-200',
        glass
          ? 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20'
          : 'bg-white shadow-lg hover:shadow-xl',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}