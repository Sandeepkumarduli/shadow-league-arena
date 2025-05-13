
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define the UserData interface used in the ActivityLogWithUser interface
interface UserData {
  id: string;
  username: string;
  email: string;
}

// Define the ActivityLog interfaces
export interface ActivityLog {
  id: string;
  type: string;
  action: string;
  details: string;
  user_id?: string;
  created_at: string;
  metadata?: any;
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: UserData;
}

interface LogActivityParams {
  type: string;
  action: string;
  details: string;
  metadata?: Record<string, any>;
  userId?: string;
}

// Function to log an activity
export const logActivity = async ({
  type,
  action,
  details,
  metadata = {},
  userId
}: LogActivityParams): Promise<void> => {
  try {
    const currentUser = userId || (await supabase.auth.getUser()).data.user?.id;
    
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        type,
        action,
        details,
        metadata,
        user_id: currentUser
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't show toast for logging errors to avoid overwhelming the user
    // These are background operations that shouldn't interrupt the UX
  }
};

// Function to fetch activity logs with user information
export const fetchActivityLogs = async (): Promise<ActivityLogWithUser[]> => {
  try {
    // First, fetch all activity logs
    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (logsError) throw logsError;
    if (!logs) return [];
    
    // Get unique user IDs from the logs
    const userIds = logs
      .map(log => log.user_id)
      .filter((id, index, self) => id && self.indexOf(id) === index) as string[];
    
    // If there are user IDs, fetch user data
    let usersMap: Record<string, UserData> = {};
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, email')
        .in('id', userIds);
      
      if (usersError) throw usersError;
      
      // Convert users array to a map for quick lookup
      usersMap = (users || []).reduce((map: Record<string, UserData>, user) => {
        map[user.id] = user;
        return map;
      }, {});
    }
    
    // Combine logs with user data
    return logs.map(log => ({
      ...log,
      user: log.user_id ? usersMap[log.user_id] : undefined
    }));
    
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    toast({
      title: "Failed to fetch activity logs",
      description: "There was an error loading the activity logs.",
      variant: "destructive"
    });
    return [];
  }
};

// Function to clear activity logs older than a specified time
export const clearOldActivityLogs = async (days = 30): Promise<boolean> => {
  try {
    // Calculate the cutoff date (30 days ago by default)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());
      
    if (error) throw error;
    
    toast({
      title: "Logs Cleared",
      description: `Activity logs older than ${days} days have been cleared.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing activity logs:', error);
    toast({
      title: "Failed to clear logs",
      description: "There was an error clearing the activity logs.",
      variant: "destructive"
    });
    return false;
  }
};
