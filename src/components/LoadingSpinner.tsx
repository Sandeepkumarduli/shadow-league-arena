
import React from 'react';
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner = ({ 
  fullScreen = false, 
  size = 'md',
  className = '',
  text = 'LOADING' 
}: LoadingSpinnerProps) => {
  
  // Size variant classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-esports-darker flex flex-col items-center justify-center z-50">
        <div className={cn("relative", sizeClasses[size])}>
          <div className="absolute inset-0 border-4 border-esports-accent/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-esports-accent rounded-full animate-spin"></div>
        </div>
        {text && (
          <div className="mt-4 text-esports-accent font-bold tracking-wider">{text}</div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex justify-center items-center p-4", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 border-4 border-esports-accent/20 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-esports-accent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
