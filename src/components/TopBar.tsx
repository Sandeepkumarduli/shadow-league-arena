
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TopBar = () => {
  return (
    <div className="h-16 bg-esports-darker/80 backdrop-blur-md border-b border-esports-accent/20 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Live Tournaments */}
        <Badge variant="outline" className="bg-esports-green/20 text-esports-green border-none px-3 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-esports-green rounded-full animate-pulse"></span>
          <span>Live Tournaments</span>
        </Badge>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white hover:bg-esports-accent/10">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-esports-accent rounded-full"></span>
        </Button>
        
        {/* User profile */}
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-esports-accent/10">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
