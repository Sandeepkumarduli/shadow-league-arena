
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  count?: number;
  className?: string;
  variant?: 'card' | 'line' | 'circle';
  height?: string;
  width?: string;
}

/**
 * Reusable loading state component with different variants
 */
export function LoadingState({
  count = 1,
  className,
  variant = 'line',
  height = 'h-5',
  width = 'w-full',
}: LoadingStateProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="bg-esports-dark border border-esports-accent/20 rounded-lg overflow-hidden p-4 space-y-3">
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        );
        
      case 'circle':
        return (
          <Skeleton className={cn("rounded-full", height, width, className)} />
        );
        
      case 'line':
      default:
        return (
          <Skeleton className={cn(height, width, className)} />
        );
    }
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}

export default LoadingState;
