
import { useState } from "react";
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import NotificationsPanel from "./NotificationsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TopBarProps {
  isAdmin?: boolean;
}

const TopBar = ({ isAdmin = false }: TopBarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userStatus, setUserStatus] = useState("Active");
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Update user status to active
      if (user) {
        // In a real implementation, you might update a status field in the users table
        setUserStatus("Active");
      }
      
      // Dispatch a custom event that components can listen for to refresh their data
      const refreshEvent = new CustomEvent('app:refresh');
      window.dispatchEvent(refreshEvent);
      
      toast({
        title: "Data Refreshed",
        description: "All data has been refreshed from the database.",
      });
      
      // Reload the current page to ensure fresh data
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 md:px-6 h-16 border-b border-[#1977d4]/20 bg-esports-dark">
      {/* Left side - Breadcrumbs or title */}
      <div className="flex items-center">
        {isAdmin ? (
          <h2 className="text-xl font-bold font-rajdhani text-white tracking-wider">
            ADMIN<span className="text-[#1977d4]">PANEL</span>
          </h2>
        ) : null}
      </div>

      {/* Refresh button */}
      <div className="hidden md:flex ml-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-[#1977d4]/20 text-[#1977d4] hover:bg-[#1977d4]/10"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Right side - Search, Notifications, User */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-md bg-esports-darker border border-[#1977d4]/20 text-white text-sm focus:outline-none focus:border-[#1977d4]"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost"
            size="icon"
            className="relative text-gray-300 hover:text-white"
            onClick={toggleNotifications}
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#1977d4]">
              0
            </Badge>
          </Button>

          {isNotificationsOpen && (
            <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />
          )}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-[#1977d4]/50">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#1977d4]/20 text-[#1977d4]">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white leading-none">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                    {userStatus}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 bg-esports-dark border-[#1977d4]/20">
            <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-[#1977d4]/20" />
            
            <DropdownMenuItem 
              className="text-gray-300 hover:text-white focus:text-white cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="text-gray-300 hover:text-white focus:text-white cursor-pointer"
              onClick={() => navigate("/my-account")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-[#1977d4]/20" />
            
            <DropdownMenuItem 
              className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
