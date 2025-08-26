import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'performance' | 'strava';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = clsx(
    'inline-flex items-center justify-center font-semibold',
    'transition-all duration-200 ease-out',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fitness-navy-900',
    'active:transform active:scale-95',
    fullWidth && 'w-full'
  );
  
  const variantClasses = {
    primary: clsx(
      'bg-gradient-to-r from-fitness-orange-500 to-fitness-orange-600',
      'hover:from-fitness-orange-400 hover:to-fitness-orange-500',
      'text-white shadow-fitness-lg hover:shadow-glow-orange',
      'border border-fitness-orange-500/20',
      'focus:ring-fitness-orange-500/50'
    ),
    secondary: clsx(
      'bg-gradient-to-r from-fitness-navy-700/80 to-fitness-navy-800/80',
      'hover:from-fitness-navy-600/90 hover:to-fitness-navy-700/90',
      'text-white border border-fitness-navy-600/40',
      'shadow-fitness hover:shadow-fitness-lg',
      'backdrop-blur-sm',
      'focus:ring-fitness-blue-500/50'
    ),
    ghost: clsx(
      'text-fitness-navy-200 hover:text-white',
      'hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10',
      'focus:ring-fitness-navy-500/50'
    ),
    outline: clsx(
      'text-white border-2 border-fitness-navy-500/50',
      'hover:border-fitness-orange-500/50 hover:bg-fitness-orange-500/10',
      'focus:ring-fitness-orange-500/50',
      'backdrop-blur-sm'
    ),
    danger: clsx(
      'bg-gradient-to-r from-fitness-red-500 to-fitness-red-600',
      'hover:from-fitness-red-400 hover:to-fitness-red-500',
      'text-white shadow-fitness',
      'focus:ring-fitness-red-500/50'
    ),
    success: clsx(
      'bg-gradient-to-r from-fitness-green-500 to-fitness-green-600',
      'hover:from-fitness-green-400 hover:to-fitness-green-500',
      'text-white shadow-fitness',
      'focus:ring-fitness-green-500/50'
    ),
    performance: clsx(
      'bg-gradient-to-r from-fitness-blue-500 via-fitness-green-500 to-fitness-orange-500',
      'hover:from-fitness-blue-400 hover:via-fitness-green-400 hover:to-fitness-orange-400',
      'text-white shadow-fitness-lg hover:shadow-glow-blue',
      'focus:ring-fitness-blue-500/50',
      'animate-pulse-slow'
    ),
    strava: clsx(
      'bg-gradient-to-r from-strava-orange to-strava-orange-light',
      'hover:from-strava-orange-dark hover:to-strava-orange',
      'text-white shadow-fitness',
      'focus:ring-strava-orange/50'
    ),
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs rounded-md gap-1',
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-base rounded-xl gap-2',
    lg: 'px-6 py-3 text-lg rounded-xl gap-2.5',
    xl: 'px-8 py-4 text-xl rounded-2xl gap-3',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const LoadingSpinner = () => (
    <div className={clsx('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner />
          <span className="opacity-75">Loading...</span>
        </>
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className={iconSizes[size]}>{icon}</span>
          {children}
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          <span className={iconSizes[size]}>{icon}</span>
        </>
      );
    }

    return children;
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
}