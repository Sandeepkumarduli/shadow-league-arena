
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
}

const RefreshButton = ({ onRefresh, className = "" }: RefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`border-[#1977d4]/20 text-[#1977d4] hover:bg-[#1977d4]/10 ${className}`}
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </Button>
  );
};

export default RefreshButton;
