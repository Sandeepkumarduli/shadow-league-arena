
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Clock, User, Trophy, Trash, Ban, Coins, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample activities data
const initialActivities = [
  {
    id: "1",
    type: "tournament_created",
    title: "Tournament Created",
    description: "BGMI Pro League Season 5 was created",
    user: "AdminUser",
    timestamp: "2025-05-12 10:30:22",
    category: "tournament"
  },
  {
    id: "2",
    type: "prize_distributed",
    title: "Prize Distributed",
    description: "1,800 rdCoins awarded to Phoenix Rising team for COD Mobile Battle Royale",
    user: "AdminUser",
    timestamp: "2025-05-11 14:45:15",
    category: "prize"
  },
  {
    id: "3",
    type: "user_banned",
    title: "User Banned",
    description: "User ShadowNinja was banned for violations",
    user: "AdminUser",
    timestamp: "2025-05-10 09:15:30",
    category: "user"
  },
  {
    id: "4",
    type: "team_banned",
    title: "Team Banned",
    description: "Team 'FreeFire Foxes' was banned",
    user: "AdminUser",
    timestamp: "2025-05-09 16:22:10",
    category: "team"
  },
  {
    id: "5",
    type: "coins_sent",
    title: "Coins Sent",
    description: "1,000 rdCoins sent to user FireHawk22",
    user: "AdminUser",
    timestamp: "2025-05-08 11:05:45",
    category: "coin"
  },
  {
    id: "6",
    type: "tournament_deleted",
    title: "Tournament Deleted",
    description: "Free Fire Weekend Cup was deleted",
    user: "AdminUser",
    timestamp: "2025-05-07 13:30:00",
    category: "tournament"
  },
  {
    id: "7",
    type: "team_created",
    title: "Team Created",
    description: "New team 'Esports Legends' was created",
    user: "AdminUser",
    timestamp: "2025-05-06 10:15:20",
    category: "team"
  },
  {
    id: "8",
    type: "user_created",
    title: "User Created",
    description: "New user 'GamingWizard' was created by admin",
    user: "AdminUser",
    timestamp: "2025-05-05 09:45:12",
    category: "user"
  }
];

const ActivityLog = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState(initialActivities);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter activities based on selections
  const filteredActivities = activities.filter(activity => {
    // Apply type filter
    if (typeFilter !== "all" && activity.type !== typeFilter) return false;
    
    // Apply tab filter
    if (activeTab !== "all" && activity.category !== activeTab) return false;
    
    // Apply search query
    if (
      searchQuery && 
      !activity.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !activity.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false;
    
    return true;
  });
  
  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "tournament_created":
        return <PlusCircle className="h-5 w-5 text-green-400" />;
      case "tournament_deleted":
        return <Trash className="h-5 w-5 text-red-400" />;
      case "prize_distributed":
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case "user_banned":
      case "team_banned":
        return <Ban className="h-5 w-5 text-red-400" />;
      case "coins_sent":
        return <Coins className="h-5 w-5 text-blue-400" />;
      case "team_created":
      case "user_created":
        return <User className="h-5 w-5 text-green-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get badge color based on type
  const getActivityBadgeColor = (category: string) => {
    switch (category) {
      case "tournament":
        return "bg-purple-500/20 text-purple-400";
      case "prize":
        return "bg-yellow-500/20 text-yellow-400";
      case "user":
        return "bg-blue-500/20 text-blue-400";
      case "team":
        return "bg-green-500/20 text-green-400";
      case "coin":
        return "bg-amber-500/20 text-amber-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };
  
  const clearActivityLog = () => {
    toast({
      title: "Confirm Clear",
      description: "This action would clear all activity logs in a real application.",
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center text-gray-400 hover:text-white mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        </div>
        
        <Button
          variant="outline" 
          size="sm"
          className="text-red-400 border-red-400/20 hover:bg-red-500/10"
          onClick={clearActivityLog}
        >
          Clear Log
        </Button>
      </div>
      
      {/* Filter Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-esports-darker w-full justify-start overflow-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-esports-accent">All Activities</TabsTrigger>
          <TabsTrigger value="tournament" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-400">Tournaments</TabsTrigger>
          <TabsTrigger value="prize" className="data-[state=active]:bg-yellow-500/30 data-[state=active]:text-yellow-400">Prizes</TabsTrigger>
          <TabsTrigger value="user" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-400">Users</TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-green-500/30 data-[state=active]:text-green-400">Teams</TabsTrigger>
          <TabsTrigger value="coin" className="data-[state=active]:bg-amber-500/30 data-[state=active]:text-amber-400">Coins</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 md:col-span-2">
          <InputWithIcon
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-esports-dark border-esports-accent/20 text-white"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div>
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="bg-esports-dark border-esports-accent/20 text-white">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tournament_created">Tournament Created</SelectItem>
              <SelectItem value="tournament_deleted">Tournament Deleted</SelectItem>
              <SelectItem value="prize_distributed">Prize Distributed</SelectItem>
              <SelectItem value="user_banned">User Banned</SelectItem>
              <SelectItem value="team_banned">Team Banned</SelectItem>
              <SelectItem value="coins_sent">Coins Sent</SelectItem>
              <SelectItem value="team_created">Team Created</SelectItem>
              <SelectItem value="user_created">User Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-4 flex items-start">
                <div className="bg-esports-darker p-3 rounded-full mr-4">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{activity.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <Badge className={getActivityBadgeColor(activity.category)}>
                        {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    <span>{activity.user}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No activities match your filters.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivityLog;
