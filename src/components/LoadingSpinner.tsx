
import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-esports-darker/80 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-esports-accent"></div>
      </div>
    );
  }

  return (
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-esports-accent"></div>
  );
};

export default LoadingSpinner;
