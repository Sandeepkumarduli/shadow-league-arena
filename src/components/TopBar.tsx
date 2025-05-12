
import { useState } from "react";
import { Bell, RefreshCcw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import NotificationsPanel from "./NotificationsPanel";

interface TopBarProps {
  onRefresh?: () => void;
}

const TopBar = ({ onRefresh }: TopBarProps) => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // Check if any live tournaments are available - this would come from context or API in a real app
  const hasLiveTournaments = true; // Replace with actual logic in production

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="h-16 bg-esports-darker/80 backdrop-blur-md border-b border-esports-accent/20 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Active/Offline Status */}
        <Badge variant="outline" className={`${hasLiveTournaments ? 'bg-esports-green/20 text-esports-green' : 'bg-gray-600/20 text-gray-400'} border-none px-3 py-1.5 flex items-center gap-1.5`}>
          {hasLiveTournaments && <span className="w-2 h-2 bg-esports-green rounded-full animate-pulse"></span>}
          <span>{hasLiveTournaments ? 'Active' : 'Offline'}</span>
        </Badge>
        
        {/* Refresh Button */}
        <Button 
          onClick={handleRefresh} 
          variant="ghost" 
          size="icon" 
          className="text-gray-300 hover:text-white hover:bg-esports-accent/10"
          title="Refresh data"
        >
          <RefreshCcw className="h-5 w-5" />
        </Button>
        
        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-gray-300 hover:text-white hover:bg-esports-accent/10"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-esports-accent rounded-full"></span>
          </Button>
          
          {isNotificationOpen && (
            <NotificationsPanel onClose={() => setIsNotificationOpen(false)} />
          )}
        </div>
        
        {/* User profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-esports-accent/10">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mr-2 bg-esports-dark border-esports-accent/30">
            <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-esports-accent/20" />
            <DropdownMenuItem 
              className="text-gray-300 hover:text-white hover:bg-esports-accent/10 cursor-pointer"
              onClick={handleProfileClick}
            >
              Profile Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
