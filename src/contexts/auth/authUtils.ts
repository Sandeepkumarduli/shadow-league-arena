
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from './types';

// Function to set user data from auth session and fetch additional info if needed
export const setUserDataFromSession = async (user: User | null): Promise<{
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}> => {
  if (!user) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false
    };
  }
  
  try {
    // Check if user is admin in the database
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching user admin status:", error);
    }

    // Set admin status from database first, or from user metadata as backup
    const adminStatus = data?.is_admin || user.user_metadata?.is_admin || false;
    
    // Store in localStorage for backup/faster access
    localStorage.setItem('isAdmin', adminStatus.toString());
    
    return {
      user,
      isAuthenticated: true,
      isAdmin: adminStatus
    };
  } catch (error) {
    console.error("Error setting user data:", error);
    // Default to user metadata if database query fails
    return {
      user,
      isAuthenticated: true,
      isAdmin: user.user_metadata?.is_admin || false
    };
  }
};

// Function for user login
export const loginUser = async (email: string, password: string): Promise<{
  success: boolean;
  user?: User;
  error?: Error;
}> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      throw error;
    }
    
    if (data?.user) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      return { success: true, user: data.user as User };
    }
    return { success: false };
  } catch (error: any) {
    console.error("Login error:", error.message);
    toast({
      title: "Login Failed",
      description: error.message || "Invalid email or password",
      variant: "destructive",
    });
    return { success: false, error };
  }
};

// Function for admin login
export const adminLogin = async (username: string, password: string): Promise<{
  success: boolean;
  adminUser?: User;
  error?: Error;
}> => {
  try {
    // Hardcoded admin credentials
    if (username === "Sandeepkumar" && password === "12345678") {
      // Create a mock user object
      const adminUser = {
        id: "admin-user",
        email: "admin@example.com",
        user_metadata: {
          username: "Sandeepkumar",
          is_admin: true
        }
      };
      
      // Store admin session in localStorage for persistence
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      localStorage.setItem('isAdmin', 'true');
      
      toast({
        title: "Admin Login Successful",
        description: "Welcome to the admin dashboard!",
      });
      return { success: true, adminUser: adminUser as User };
    } else {
      throw new Error("Invalid admin credentials");
    }
  } catch (error: any) {
    console.error("Admin login error:", error.message);
    toast({
      title: "Admin Login Failed",
      description: error.message || "Invalid username or password",
      variant: "destructive",
    });
    return { success: false, error };
  }
};

// Function for user signup
export const signupUser = async (
  email: string, 
  password: string, 
  username: string, 
  phone: string, 
  bgmiid?: string
): Promise<{
  success: boolean;
  error?: Error;
}> => {
  try {
    // Create new user with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone,
          bgmiid,
          is_admin: false
        }
      }
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      return { success: false };
    }

    // Ensure user profile is created in the database
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        username,
        email,
        phone,
        bgmiid,
        is_admin: false
      }]);

    if (userError) {
      console.error("Error creating user profile:", userError);
    }

    // Create wallet for the new user
    const { error: walletError } = await supabase
      .from('wallets')
      .insert([{
        user_id: data.user.id,
        balance: 0
      }]);

    if (walletError) {
      console.error("Error creating wallet:", walletError);
    }

    toast({
      title: "Account Created",
      description: "You have been successfully registered!",
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error.message);
    toast({
      title: "Signup Failed",
      description: error.message || "Could not create account",
      variant: "destructive",
    });
    return { success: false, error };
  }
};

// Function for user logout
export const logoutUser = async (): Promise<void> => {
  try {
    // Check if it's an admin user using localStorage
    const isAdminUser = localStorage.getItem('adminUser');
    
    if (isAdminUser) {
      // Clear admin session from localStorage
      localStorage.removeItem('adminUser');
      localStorage.removeItem('isAdmin');
      
      toast({
        title: "Admin Logout",
        description: "Admin logout successful",
      });
    } else {
      // Regular user logout with Supabase
      await supabase.auth.signOut();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    }
    
  } catch (error: any) {
    console.error("Logout error:", error.message);
    toast({
      title: "Logout Failed",
      description: error.message || "Could not log out",
      variant: "destructive",
    });
    throw error;
  }
};

// Function to update user profile
export const updateUserProfile = async (user: User, profileData: any): Promise<void> => {
  try {
    if (!user) throw new Error("Not authenticated");
    
    // Update user metadata in Supabase Auth
    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: profileData
    });
    
    if (authUpdateError) throw authUpdateError;
    
    // Update user data in the users table
    const { error: profileUpdateError } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', user.id);
    
    if (profileUpdateError) throw profileUpdateError;
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated",
    });
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    toast({
      title: "Update Failed",
      description: error.message || "Could not update profile",
      variant: "destructive",
    });
    throw error;
  }
};
