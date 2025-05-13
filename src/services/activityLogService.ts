
import { supabase, createRealtimeChannel } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// ActivityLog interface
export interface ActivityLog {
  id: string;
  type: string;
  action: string;
  details: string;
  user_id?: string;
  created_at: string;
  metadata?: any;
  username?: string;
}

// Fetch activity logs with optional filters
export const fetchActivityLogs = async (filters?: Record<string, any>): Promise<ActivityLog[]> => {
  try {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'type' && value !== 'all') {
            // Use type assertion to help TypeScript
            (query as any).eq('type', value);
          } else if (key !== 'type') {
            // Use type assertion to help TypeScript
            (query as any).eq(key, value);
          }
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Get usernames for user_ids
    const userIds = data
      ?.filter(log => log.user_id)
      .map(log => log.user_id) || [];
    
    let usernameMap: Record<string, string> = {};
    
    if (userIds.length > 0) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .in('id', userIds);
        
      if (!userError && userData) {
        usernameMap = userData.reduce((acc, user) => {
          acc[user.id] = user.username;
          return acc;
        }, {} as Record<string, string>);
      }
    }
    
    // Transform the data to include the username
    return data ? data.map(log => ({
      ...log,
      username: log.user_id ? usernameMap[log.user_id] : undefined
    })) : [];
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    toast({
      title: "Failed to fetch activity logs",
      description: "There was an error loading activity logs. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Subscribe to activity log changes
export const subscribeActivityLogs = (callback: (logs: ActivityLog[]) => void, filters?: Record<string, any>) => {
  // Initial fetch
  fetchActivityLogs(filters).then(callback);
  
  // Set up real-time subscription
  const channel = createRealtimeChannel('activity_logs', () => {
    fetchActivityLogs(filters).then(callback);
  });
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Create a new activity log
export const logActivity = async (activityData: Omit<ActivityLog, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([activityData])
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};
