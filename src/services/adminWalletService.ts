
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "./activityLogService";

// Define interfaces for our DB responses and parameters
interface AdminWallet {
  id: string;
  balance: number;
  updated_at: string;
}

interface TransactionParams {
  userId: string;
  amount: number;
  description?: string;
}

// Fetch admin wallet
export const fetchAdminWallet = async (): Promise<AdminWallet | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_wallet')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching admin wallet:', error);
    toast({
      title: "Failed to fetch admin wallet",
      description: "There was an error loading admin wallet data.",
      variant: "destructive"
    });
    return null;
  }
};

// Give coins to user (from admin wallet to user wallet)
export const giveCoinsToUser = async ({ userId, amount, description }: TransactionParams): Promise<boolean> => {
  if (amount <= 0) {
    toast({
      title: "Invalid amount",
      description: "Please enter a positive amount of coins.",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    // Call Supabase function to give coins
    const { data, error } = await supabase.rpc(
      'give_coins_to_user',
      { 
        user_id: userId, 
        coin_amount: amount, 
        transaction_description: description || "Admin gave coins" 
      }
    );

    if (error) throw error;
    
    // Log the activity
    await logActivity({
      type: 'transaction',
      action: 'give_coins',
      details: `Admin gave ${amount} rdCoins to user`,
      metadata: { userId, amount, description }
    });
    
    toast({
      title: "Coins Added",
      description: `Successfully added ${amount} rdCoins to user wallet.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error giving coins to user:', error);
    toast({
      title: "Failed to give coins",
      description: "There was an error processing this transaction.",
      variant: "destructive"
    });
    return false;
  }
};

// Deduct coins from user (add to admin wallet)
export const deductCoinsFromUser = async ({ userId, amount, description }: TransactionParams): Promise<boolean> => {
  if (amount <= 0) {
    toast({
      title: "Invalid amount",
      description: "Please enter a positive amount of coins.",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    // Call Supabase function to deduct coins
    const { data, error } = await supabase.rpc(
      'deduct_coins_from_user',
      {
        user_id: userId, 
        coin_amount: amount, 
        transaction_description: description || "Admin deducted coins" 
      }
    );

    if (error) throw error;
    
    // Log the activity
    await logActivity({
      type: 'transaction',
      action: 'deduct_coins',
      details: `Admin deducted ${amount} rdCoins from user`,
      metadata: { userId, amount, description }
    });
    
    toast({
      title: "Coins Deducted",
      description: `Successfully deducted ${amount} rdCoins from user wallet.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error deducting coins from user:', error);
    toast({
      title: "Failed to deduct coins",
      description: "There was an error processing this transaction.",
      variant: "destructive"
    });
    return false;
  }
};

// Alias functions for backward compatibility
export const transferCoinsToUser = giveCoinsToUser;
