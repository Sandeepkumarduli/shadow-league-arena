
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './useAuthContext';
import { 
  AuthProviderProps, 
  User 
} from './types';
import {
  setUserDataFromSession,
  loginUser,
  adminLogin as adminLoginUtil,
  signupUser,
  logoutUser,
  updateUserProfile
} from './authUtils';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          const userData = await setUserDataFromSession(session.user as User);
          setUser(userData.user);
          setIsAuthenticated(userData.isAuthenticated);
          setIsAdmin(userData.isAdmin);
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
        console.log("Auth event:", event);
        if (session?.user) {
          const userData = await setUserDataFromSession(session.user as User);
          setUser(userData.user);
          setIsAuthenticated(userData.isAuthenticated);
          setIsAdmin(userData.isAdmin);
          console.info("Auth state changed, new session: true");
        } else if (event === 'SIGNED_OUT') {
          console.info("User signed out, clearing auth state");
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('adminUser');
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
      const result = await loginUser(email, password);
      
      if (result.success && result.user) {
        const userData = await setUserDataFromSession(result.user);
        setUser(userData.user);
        setIsAuthenticated(userData.isAuthenticated);
        setIsAdmin(userData.isAdmin);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await adminLoginUtil(username, password);
      
      if (result.success && result.adminUser) {
        setUser(result.adminUser);
        setIsAuthenticated(true);
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    username: string, 
    phone: string, 
    bgmiid?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signupUser(email, password, username, phone, bgmiid);
      return result.success;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      
      // Explicitly clear user data here
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      // Force navigate to home page after logout
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("Not authenticated");
      
      await updateUserProfile(user, profileData);
      
      // Update the local user state
      setUser({
        ...user,
        user_metadata: {
          ...(user.user_metadata || {}),
          ...profileData
        }
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
