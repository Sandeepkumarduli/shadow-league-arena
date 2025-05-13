
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
  balance: number;
}

// Type for update user params
type UpdateUserParams = Partial<Omit<User, 'id' | 'created_at' | 'updated_at' | 'balance'>> & { id: string };

// Fetch users with optional filters
export const fetchUsers = async (filters?: Record<string, any>): Promise<User[]> => {
  try {
    // First get users
    let query = supabase.from('users').select('*');
    
    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data: users, error: usersError } = await query;
    if (usersError) throw usersError;
    
    // Then fetch their wallet balances
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('user_id, balance');
      
    if (walletsError) throw walletsError;
    
    // Create a map of user_id to balance
    const balanceMap: Record<string, number> = {};
    if (wallets) {
      wallets.forEach(wallet => {
        if (wallet.user_id) {
          balanceMap[wallet.user_id] = wallet.balance || 0;
        }
      });
    }
    
    // Combine user data with balance
    return users ? users.map(user => ({
      ...user,
      balance: balanceMap[user.id] || 0
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
export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Now fetch the user's balance to return complete user data
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', id)
      .single();
      
    if (walletError) {
      console.error('Error fetching user wallet:', walletError);
      // Continue without the balance data
      return {
        ...data,
        balance: 0
      };
    }
    
    return {
      ...data,
      balance: wallet?.balance || 0
    };
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
