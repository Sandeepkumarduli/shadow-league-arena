
import { supabase, createRealtimeChannel } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  bgmiid?: string;
  balance: number; // Added balance field
}

// Fetch users with optional filters
export const fetchUsers = async (filters?: Record<string, any>): Promise<User[]> => {
  try {
    let query = supabase
      .from('users')
      .select('*, wallets!inner(balance)')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform the data to include balance
    return data ? data.map(user => ({
      ...user,
      balance: user.wallets.balance
    })) : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    toast({
      title: "Failed to fetch users",
      description: "There was an error loading users. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Subscribe to user changes
export const subscribeUserChanges = (callback: (users: User[]) => void) => {
  // Initial fetch
  fetchUsers().then(callback);
  
  // Set up real-time subscription
  const channel = createRealtimeChannel('users', () => {
    fetchUsers().then(callback);
  });
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Update user
export const updateUser = async (id: string, userData: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error updating user:', error);
    toast({
      title: "Failed to update user",
      description: "There was an error updating the user. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
