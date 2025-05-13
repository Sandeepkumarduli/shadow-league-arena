
import { supabase, createRealtimeChannel } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "./activityLogService";
import { fetchUserById } from "./authService";

// AdminWallet interface
export interface AdminWallet {
  id: string;
  balance: number;
  updated_at: string;
}

// Transaction interface
export interface Transaction {
  id: string;
  user_id?: string;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  reference_id?: string;
  user?: {
    username: string;
  }
}

// Fetch admin wallet
export const fetchAdminWallet = async (): Promise<AdminWallet | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_wallet')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data as AdminWallet;
  } catch (error) {
    console.error('Error fetching admin wallet:', error);
    toast({
      title: "Failed to fetch admin wallet",
      description: "There was an error loading admin wallet data. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Subscribe to admin wallet changes
export const subscribeAdminWallet = (callback: (wallet: AdminWallet | null) => void) => {
  // Initial fetch
  fetchAdminWallet().then(callback);
  
  // Set up real-time subscription
  const channel = createRealtimeChannel('admin_wallet', () => {
    fetchAdminWallet().then(callback);
  });
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Fetch transactions with optional filters
export const fetchTransactions = async (filters?: Record<string, any>): Promise<Transaction[]> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*, user:users(username)')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'type' && value !== 'all') {
            query = query.eq('type', value);
          } else if (key !== 'type') {
            query = query.eq(key, value);
          }
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data as unknown as Transaction[];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    toast({
      title: "Failed to fetch transactions",
      description: "There was an error loading transactions. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Subscribe to transaction changes
export const subscribeTransactions = (callback: (transactions: Transaction[]) => void, filters?: Record<string, any>) => {
  // Initial fetch
  fetchTransactions(filters).then(callback);
  
  // Set up real-time subscription
  const channel = createRealtimeChannel('transactions', () => {
    fetchTransactions(filters).then(callback);
  });
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Add funds to admin wallet
export const addFundsToAdminWallet = async (amount: number, source: string) => {
  const { data: adminWalletData } = await supabase.auth.getUser();
  const userId = adminWalletData.user?.id;
  
  try {
    // First, get current admin wallet
    const adminWallet = await fetchAdminWallet();
    if (!adminWallet) throw new Error("Admin wallet not found");
    
    // Start a Supabase transaction
    const { data, error } = await supabase.rpc('add_funds_to_admin_wallet', {
      p_amount: amount,
      p_description: `Admin bank deposit: ${source}`,
      p_user_id: userId
    });
    
    if (error) throw error;
    
    // Log the activity
    await logActivity({
      type: 'coins',
      action: 'add',
      details: `Added ${amount} rdCoins to admin wallet`,
      user_id: userId,
      metadata: { amount, source }
    });
    
    toast({
      title: "Funds Added",
      description: `Added ${amount} rdCoins to the admin wallet.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error adding funds to admin wallet:', error);
    toast({
      title: "Failed to add funds",
      description: "There was an error adding funds to the admin wallet. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Adjust user balance
export const adjustUserBalance = async (
  userId: string, 
  amount: number, 
  type: 'credit' | 'debit', 
  description?: string,
  fromAdminWallet = false
) => {
  const { data: adminData } = await supabase.auth.getUser();
  const adminId = adminData.user?.id;
  
  try {
    if (fromAdminWallet) {
      // Check if admin wallet has enough balance for deduction
      const adminWallet = await fetchAdminWallet();
      if (!adminWallet) throw new Error("Admin wallet not found");
      
      if (type === 'credit' && adminWallet.balance < amount) {
        toast({
          title: "Insufficient Balance",
          description: "Admin wallet does not have enough coins for this transfer.",
          variant: "destructive"
        });
        return false;
      }
    }
    
    // Call the appropriate RPC function
    const functionName = fromAdminWallet 
      ? (type === 'credit' ? 'transfer_from_admin_to_user' : 'transfer_from_user_to_admin')
      : (type === 'credit' ? 'add_coins_to_user' : 'deduct_coins_from_user');
    
    const { data, error } = await supabase.rpc(functionName, {
      p_user_id: userId,
      p_amount: amount,
      p_description: description || `Admin ${type === 'credit' ? 'added' : 'deducted'} coins`,
      p_admin_id: adminId
    });
    
    if (error) throw error;
    
    // Log the activity
    await logActivity({
      type: 'coins',
      action: type,
      details: `${type === 'credit' ? 'Added' : 'Deducted'} ${amount} rdCoins ${type === 'credit' ? 'to' : 'from'} user`,
      user_id: adminId,
      metadata: { userId, amount, fromAdminWallet }
    });
    
    // Get user data to show in toast
    const userData = await fetchUserById(userId);
    const username = userData?.username || userId;
    
    toast({
      title: "Balance Adjusted",
      description: `${type === 'credit' ? 'Added' : 'Deducted'} ${amount} rdCoins ${type === 'credit' ? 'to' : 'from'} ${username}.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error adjusting user balance:', error);
    toast({
      title: "Failed to adjust balance",
      description: "There was an error adjusting the user's balance. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
