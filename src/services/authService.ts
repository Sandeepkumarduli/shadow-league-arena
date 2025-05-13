
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "./userService";

// Fetch user by ID
export const fetchUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data as User;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

// Fetch current authenticated user's profile
export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (error) throw error;
    
    return data as User;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};
