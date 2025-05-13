
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, Archive } from "lucide-react";
import { 
  fetchActivityLogs, 
  ActivityLogWithUser, 
  clearOldActivityLogs,
  subscribeToActivityLogs
} from "@/services/activityLogService";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogWithUser[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLogWithUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(30);

  useEffect(() => {
    const unsubscribe = subscribeToActivityLogs((data) => {
      setLogs(data);
      setFilteredLogs(data);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = logs.filter((log) => {
        return (
          log.action.toLowerCase().includes(lowercasedQuery) ||
          log.type.toLowerCase().includes(lowercasedQuery) ||
          log.details.toLowerCase().includes(lowercasedQuery) ||
          log.user?.username?.toLowerCase().includes(lowercasedQuery)
        );
      });
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  }, [logs, searchQuery]);

  const handleRefresh = async () => {
    setIsLoading(true);
    const data = await fetchActivityLogs();
    setLogs(data);
    setFilteredLogs(data);
    setIsLoading(false);
    toast({
      title: "Logs Refreshed",
      description: "Activity logs have been refreshed."
    });
  };

  const handleClearOldLogs = async () => {
    setIsDeleting(true);
    try {
      const success = await clearOldActivityLogs(daysToKeep);
      
      if (success) {
        await handleRefresh();
      }
    } finally {
      setIsDeleting(false);
      setShowClearDialog(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "user":
        return "bg-blue-500/20 text-blue-500";
      case "tournament":
        return "bg-green-500/20 text-green-500";
      case "transaction":
        return "bg-yellow-500/20 text-yellow-500";
      case "admin":
        return "bg-purple-500/20 text-purple-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
      case "add":
      case "give_coins":
        return "bg-green-500/20 text-green-500";
      case "update":
      case "edit":
        return "bg-blue-500/20 text-blue-500";
      case "delete":
      case "remove":
      case "deduct_coins":
        return "bg-red-500/20 text-red-500";
      case "admin_grant":
        return "bg-purple-500/20 text-purple-500";
      case "admin_reject":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-[#1977d4]/30 text-gray-400 hover:text-white"
            onClick={() => setShowClearDialog(true)}
          >
            <Archive className="h-4 w-4 mr-2" />
            Clear Old Logs
          </Button>
          <Button 
            variant="outline" 
            className="border-[#1977d4]/30 text-[#1977d4]"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-esports-dark border-esports-accent/20 mb-6">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-white text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-4 pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by type, action, details or username..."
              className="pl-10 bg-esports-darker border-[#1977d4]/20 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-esports-dark border-esports-accent/20">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-white text-lg">Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-4 pt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-700">
                    <TableHead className="w-[120px] text-gray-400">Type</TableHead>
                    <TableHead className="w-[120px] text-gray-400">Action</TableHead>
                    <TableHead className="text-gray-400">Details</TableHead>
                    <TableHead className="w-[180px] text-gray-400">User</TableHead>
                    <TableHead className="w-[150px] text-gray-400">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-b border-gray-700">
                      <TableCell>
                        <Badge className={`${getTypeColor(log.type)} font-normal`}>
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} font-normal`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{log.details}</TableCell>
                      <TableCell className="text-white">
                        {log.user ? log.user.username : 'System'}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No activity logs found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear Old Logs Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Clear Old Activity Logs</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will permanently delete activity logs older than the specified number of days.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="daysToKeep">Keep logs from the last</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="daysToKeep"
                type="number"
                min="1"
                max="365"
                value={daysToKeep}
                onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 30)}
                className="bg-esports-darker border-[#1977d4]/20 text-white"
              />
              <span className="text-gray-400">days</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowClearDialog(false)}
              className="text-white"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearOldLogs}
              disabled={isDeleting}
            >
              {isDeleting ? "Clearing..." : "Clear Old Logs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Helper component for the label
function Label({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-white mb-1">
      {children}
    </label>
  );
}
