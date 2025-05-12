
import React from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Sample activity log data
const activityLogs = [
  {
    id: "1",
    type: "tournament",
    action: "create",
    details: "Tournament 'BGMI Monthly Cup' was created",
    user: "Admin",
    timestamp: "2023-05-12T14:30:00Z",
  },
  {
    id: "2",
    type: "user",
    action: "ban",
    details: "User 'FireHawk22' was banned for inappropriate behavior",
    user: "Admin",
    timestamp: "2023-05-12T15:45:00Z",
  },
  {
    id: "3",
    type: "coins",
    action: "distribute",
    details: "500 rdCoins distributed to winners of 'BGMI Weekly Cup'",
    user: "System",
    timestamp: "2023-05-12T16:20:00Z",
  },
  {
    id: "4",
    type: "tournament",
    action: "update",
    details: "Tournament 'Free Fire Weekly' was updated",
    user: "Admin",
    timestamp: "2023-05-12T17:15:00Z",
  },
  {
    id: "5",
    type: "user",
    action: "unban",
    details: "User 'ThunderBolt' was unbanned",
    user: "Admin",
    timestamp: "2023-05-12T18:00:00Z",
  }
];

const ActivityLog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");

  // Filter logs based on search query and type filter
  const filteredLogs = activityLogs.filter(log => {
    // Apply type filter
    if (typeFilter !== "all" && log.type !== typeFilter) return false;
    
    // Apply search query
    if (searchQuery && !log.details.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  // Function to format the timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to get badge color based on action type
  const getBadgeVariant = (action: string) => {
    switch (action) {
      case "create":
        return "success";
      case "update":
        return "outline";
      case "delete":
        return "destructive";
      case "ban":
        return "destructive";
      case "unban":
        return "success";
      case "distribute":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Function to get badge styles based on action type
  const getBadgeStyles = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-500/20 text-green-400 border-none";
      case "update":
        return "bg-blue-500/20 text-blue-400 border-none";
      case "delete":
        return "bg-red-500/20 text-red-400 border-none";
      case "ban":
        return "bg-red-500/20 text-red-400 border-none";
      case "unban":
        return "bg-green-500/20 text-green-400 border-none";
      case "distribute":
        return "bg-yellow-500/20 text-yellow-400 border-none";
      default:
        return "bg-gray-500/20 text-gray-400 border-none";
    }
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
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <InputWithIcon
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-esports-dark border-esports-accent/20 text-white"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-esports-dark border-esports-accent/20 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="tournament">Tournaments</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="team">Teams</SelectItem>
              <SelectItem value="coins">Coins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Logs List */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-esports-accent/20 rounded-full p-3 flex-shrink-0">
                      <Activity className="h-6 w-6 text-esports-accent" />
                    </div>
                    
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-white font-medium">{log.details}</p>
                        <Badge variant="outline" className={getBadgeStyles(log.action)}>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-400">
                        <span>By {log.user}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No activity logs match your filters.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivityLog;
