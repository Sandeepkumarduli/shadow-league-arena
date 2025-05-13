
import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen, size = 8 }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-esports-darker/80 z-50">
        <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-esports-accent`}></div>
      </div>
    );
  }

  return (
    <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-esports-accent`}></div>
  );
};

export default LoadingSpinner;
