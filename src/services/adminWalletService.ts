
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define interface for admin wallet
export interface AdminWallet {
  id: string;
  balance: number;
  updated_at: string;
}

// Fetch the admin wallet
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
      description: "There was an error loading the admin wallet. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Update the admin wallet balance
export const updateAdminWalletBalance = async (newBalance: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_wallet')
      .update({ balance: newBalance })
      .eq('id', 'admin_wallet') // Assuming there's only one admin wallet with id 'admin_wallet'
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.error('Admin wallet not found or update failed.');
      toast({
        title: "Failed to update admin wallet",
        description: "Admin wallet not found or update failed.",
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Admin wallet updated",
      description: "Admin wallet balance updated successfully.",
    });
    
    return true;
  } catch (error) {
    console.error('Error updating admin wallet:', error);
    toast({
      title: "Failed to update admin wallet",
      description: "There was an error updating the admin wallet. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Process coin transfer from admin to user
export const transferCoinsToUser = async (
  userId: string,
  amount: number,
  reason: string
): Promise<boolean> => {
  if (amount <= 0) {
    toast({
      title: "Invalid amount",
      description: "Amount must be greater than zero.",
      variant: "destructive"
    });
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('transfer_coins_from_admin', { 
      target_user_id: userId,
      amount_to_transfer: amount,
      transfer_reason: reason
    });
    
    if (error) throw error;
    
    toast({
      title: "Transfer Successful",
      description: `Successfully transferred ${amount} coins to user.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error transferring coins:', error);
    toast({
      title: "Transfer Failed",
      description: "There was an error transferring coins. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Process coin deduction from user by admin
export const deductCoinsFromUser = async (
  userId: string,
  amount: number,
  reason: string
): Promise<boolean> => {
  if (amount <= 0) {
    toast({
      title: "Invalid amount",
      description: "Amount must be greater than zero.",
      variant: "destructive"
    });
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('deduct_coins_from_user', {
      target_user_id: userId,
      amount_to_deduct: amount,
      deduct_reason: reason
    });

    if (error) throw error;

    toast({
      title: "Deduction Successful",
      description: `Successfully deducted ${amount} coins from user.`,
    });

    return true;
  } catch (error) {
    console.error('Error deducting coins:', error);
    toast({
      title: "Deduction Failed",
      description: "There was an error deducting coins. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
