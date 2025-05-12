
import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner = ({ fullScreen = false }: LoadingSpinnerProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-esports-darker flex flex-col items-center justify-center z-50">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-esports-accent/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-esports-accent rounded-full animate-spin"></div>
        </div>
        <div className="mt-4 text-esports-accent font-bold tracking-wider">LOADING</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-esports-accent/20 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-esports-accent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
