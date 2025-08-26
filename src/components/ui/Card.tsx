import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'metric' | 'chart' | 'interactive' | 'highlighted' | 'compact';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  animated?: boolean;
  onClick?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  border = true,
  animated = true,
  onClick,
  header,
  footer
}: CardProps) {
  const baseClasses = clsx(
    'relative overflow-hidden',
    'transition-all duration-300 ease-out',
    animated && 'hover:transform hover:translate-y-[-2px]',
    onClick && 'cursor-pointer select-none active:scale-[0.98]'
  );

  const variantClasses = {
    default: clsx(
      'fitness-card',
      onClick && 'hover:border-fitness-navy-500/50'
    ),
    metric: clsx(
      'metric-card',
      'bg-gradient-to-br from-white/8 to-white/12',
      border && 'border border-white/15',
      'rounded-xl backdrop-blur-sm',
      onClick && 'hover:from-white/12 hover:to-white/16 hover:border-white/25'
    ),
    chart: clsx(
      'chart-container',
      'bg-gradient-to-br from-fitness-navy-900/95 to-fitness-navy-800/95',
      border && 'border border-fitness-navy-600/25',
      'rounded-xl backdrop-blur-sm'
    ),
    interactive: clsx(
      'bg-gradient-to-br from-fitness-navy-800/90 to-fitness-navy-900/90',
      border && 'border border-fitness-navy-600/30',
      'rounded-2xl backdrop-blur-sm',
      'hover:from-fitness-navy-700/95 hover:to-fitness-navy-800/95',
      'hover:border-fitness-orange-500/30 hover:shadow-glow-orange/20',
      'active:from-fitness-navy-900/95 active:to-fitness-navy-800/95'
    ),
    highlighted: clsx(
      'fitness-card-active',
      'bg-gradient-to-br from-fitness-orange-500/15 to-fitness-navy-800/90',
      border && 'border border-fitness-orange-500/40',
      'rounded-2xl shadow-glow-orange/30'
    ),
    compact: clsx(
      'bg-gradient-to-br from-white/5 to-white/8',
      border && 'border border-white/10',
      'rounded-lg backdrop-blur-sm',
      onClick && 'hover:from-white/8 hover:to-white/12 hover:border-white/20'
    )
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-fitness',
    md: 'shadow-fitness-lg',
    lg: 'shadow-fitness-xl',
    xl: 'shadow-fitness-xl hover:shadow-glow-orange/20'
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
      onClick={onClick}
    >
      {/* Background gradient overlay for enhanced visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-fitness-navy-900/20 pointer-events-none" />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {header && (
          <div className="mb-4 pb-4 border-b border-white/10">
            {header}
          </div>
        )}
        
        {children}
        
        {footer && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {footer}
          </div>
        )}
      </div>
      
      {/* Interactive glow effect */}
      {onClick && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-fitness-orange-500/5 via-transparent to-fitness-blue-500/5 rounded-inherit" />
        </div>
      )}
    </div>
  );
}

// Specialized card components for common use cases
export function MetricCard({ 
  title, 
  value, 
  unit, 
  change, 
  changeType = 'neutral',
  icon,
  className,
  ...props 
}: {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
} & Omit<CardProps, 'children' | 'variant'>) {
  const changeColors = {
    positive: 'text-fitness-green-400',
    negative: 'text-fitness-red-400',
    neutral: 'text-fitness-navy-300'
  };

  return (
    <Card variant="metric" className={clsx('min-h-[120px]', className)} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-fitness-orange-400">{icon}</span>}
            <p className="metric-label">{title}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="metric-value">{value}</span>
            {unit && <span className="text-sm text-fitness-navy-400 font-medium">{unit}</span>}
          </div>
          {change && (
            <p className={clsx('text-xs font-medium mt-1', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ChartCard({ 
  title, 
  description, 
  children, 
  className,
  ...props 
}: {
  title: string;
  description?: string;
  children: ReactNode;
} & Omit<CardProps, 'variant'>) {
  return (
    <Card variant="chart" className={className} {...props}>
      <div className="mb-6">
        <h3 className="section-title">{title}</h3>
        {description && (
          <p className="text-sm text-fitness-navy-300 mt-1">{description}</p>
        )}
      </div>
      {children}
    </Card>
  );
}