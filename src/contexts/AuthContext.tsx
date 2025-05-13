
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserMetadata {
  username?: string;
  is_admin?: boolean;
}

interface User {
  id: string;
  email: string;
  user_metadata: UserMetadata;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, phone: string, bgmiid?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  setIsAdmin: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to set user data from auth session and fetch additional info if needed
  const setUserData = async (user: User | null) => {
    if (!user) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      return;
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
      
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("Error setting user data:", error);
      // Default to user metadata if database query fails
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.user_metadata?.is_admin || false);
    }
  };

  useEffect(() => {
    // Check for existing session on initial load
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // First check for admin user in localStorage
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
          const parsedUser = JSON.parse(adminUser);
          setUser(parsedUser as User);
          setIsAuthenticated(true);
          setIsAdmin(true);
          console.info("Admin user found in localStorage");
          setIsLoading(false);
          return;
        }

        // Then check for regular Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await setUserData(session.user as User);
          console.info("Auth state changed, new session: true");
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        // Short delay to prevent flickering during quick navigation
        setTimeout(() => setIsLoading(false), 100);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await setUserData(session.user as User);
          console.info("Auth state changed, new session: true");
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        await setUserData(data.user as User);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function for admin login with hardcoded credentials
  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
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
        
        // Set admin user data
        setUser(adminUser as User);
        setIsAuthenticated(true);
        setIsAdmin(true);
        
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard!",
        });
        return true;
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
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string, phone: string, bgmiid?: string): Promise<boolean> => {
    setIsLoading(true);
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
        return false;
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
      
      return true;
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Check if it's an admin user using localStorage
      const isAdminUser = localStorage.getItem('adminUser');
      
      if (isAdminUser) {
        // Clear admin session from localStorage
        localStorage.removeItem('adminUser');
        localStorage.removeItem('isAdmin');
        
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    setIsLoading(true);
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
      
      // Update the local user state
      setUser({
        ...user,
        user_metadata: {
          ...(user.user_metadata || {}),
          ...profileData
        }
      });
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    adminLogin,
    signup,
    logout,
    updateProfile,
    setIsAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
