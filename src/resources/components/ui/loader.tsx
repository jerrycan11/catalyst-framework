'use client';

import * as React from 'react';
import { cn } from '@/resources/lib/utils';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = 'default', variant = 'spinner', text, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center gap-3', className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {variant === 'spinner' && (
          <svg
            className={cn('animate-spin text-primary', sizeClasses[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {variant === 'dots' && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-primary',
                  size === 'sm' && 'h-1.5 w-1.5',
                  size === 'default' && 'h-2 w-2',
                  size === 'lg' && 'h-3 w-3',
                  size === 'xl' && 'h-4 w-4'
                )}
                style={{
                  animation: `pulse 1.4s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {variant === 'pulse' && (
          <div
            className={cn(
              'rounded-full bg-primary animate-pulse',
              sizeClasses[size]
            )}
          />
        )}

        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    );
  }
);
Loader.displayName = 'Loader';

// Full-page loading overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  blur?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  blur = true,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80',
        blur && 'backdrop-blur-sm'
      )}
    >
      <Loader size="lg" text={text} />
    </div>
  );
};

export { Loader, LoadingOverlay };
