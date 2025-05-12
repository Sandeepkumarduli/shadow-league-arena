
import { useState } from "react";
import { Bell, RefreshCcw, User, Coins, Plus, LogOut, ShieldCheck } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import NotificationsPanel from "./NotificationsPanel";

interface TopBarProps {
  onRefresh?: () => void;
  isAdmin?: boolean;
}

const TopBar = ({ onRefresh, isAdmin = false }: TopBarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // Check if any live tournaments are available - this would come from context or API in a real app
  const hasLiveTournaments = true; // Replace with actual logic in production
  const rdCoins = 500; // This would come from context or API in a real app

  const handleProfileClick = () => {
    navigate(isAdmin ? "/admin/settings" : "/profile");
  };

  const handleAccountClick = () => {
    navigate(isAdmin ? "/admin/settings" : "/my-account");
  };

  const handleAddCoins = () => {
    navigate(isAdmin ? "/admin/coins" : "/add-coins");
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAdminDashboard = () => {
    navigate("/admin");
  };

  const handleUserDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="h-16 bg-esports-darker/80 backdrop-blur-md border-b border-esports-accent/20 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{isAdmin ? "Admin Dashboard" : "Dashboard"}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {/* rdCoins display */}
        <div className="flex items-center bg-esports-dark border border-yellow-500/30 rounded-md px-3 py-1">
          <Coins className="h-4 w-4 text-yellow-500 mr-2" />
          <span className="text-yellow-500 font-semibold">{rdCoins}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleAddCoins}
            className="h-5 w-5 ml-2 text-gray-300 hover:text-white hover:bg-yellow-500/20"
            title="Add rdCoins"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Active/Offline Status */}
        {!isAdmin && (
          <Badge variant="outline" className={`${hasLiveTournaments ? 'bg-esports-green/20 text-esports-green' : 'bg-gray-600/20 text-gray-400'} border-none px-3 py-1.5 flex items-center gap-1.5`}>
            {hasLiveTournaments && <span className="w-2 h-2 bg-esports-green rounded-full animate-pulse"></span>}
            <span>{hasLiveTournaments ? 'Active' : 'Offline'}</span>
          </Badge>
        )}
        
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
        
        {/* Switch between admin/user dashboard */}
        {isAdmin ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-300 hover:text-white hover:bg-esports-accent/10"
            title="Switch to User Dashboard"
            onClick={handleUserDashboard}
          >
            <User className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-300 hover:text-white hover:bg-esports-accent/10"
            title="Switch to Admin Dashboard"
            onClick={handleAdminDashboard}
          >
            <ShieldCheck className="h-5 w-5" />
          </Button>
        )}
        
        {/* Logout Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-300 hover:text-white hover:bg-esports-accent/10"
          title="Logout"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
        
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
            <DropdownMenuItem 
              className="text-gray-300 hover:text-white hover:bg-esports-accent/10 cursor-pointer"
              onClick={handleAccountClick}
            >
              Account Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-gray-300 hover:text-white hover:bg-esports-accent/10 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
