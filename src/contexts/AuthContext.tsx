
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AuthError, User, UserResponse, Session, AuthTokenResponse } from "@supabase/supabase-js";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  setIsAdmin: (value: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the given input is an email
  const isEmail = (input: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  // Function to check if user is admin
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      return data?.is_admin || false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  // Function to set admin status - updated to be async
  const setAdminStatus = async (value: boolean): Promise<void> => {
    setIsAdmin(value);
    // Store admin status in localStorage for persistence across page reloads
    if (value) {
      localStorage.setItem('isAdmin', 'true');
    } else {
      localStorage.removeItem('isAdmin');
    }
    return Promise.resolve();
  };

  useEffect(() => {
    // Check for admin status in localStorage on initial load
    const storedAdminStatus = localStorage.getItem('isAdmin') === 'true';
    if (storedAdminStatus) {
      setIsAdmin(true);
    }
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log("Auth state changed, new session:", !!newSession);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          const adminStatus = await checkAdminStatus(newSession.user.id);
          setIsAdmin(adminStatus);
          if (adminStatus) {
            localStorage.setItem('isAdmin', 'true');
          } else {
            localStorage.removeItem('isAdmin');
          }
        } else {
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Initial auth check, session:", !!currentSession);
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        const adminStatus = await checkAdminStatus(currentSession.user.id);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          localStorage.setItem('isAdmin', 'true');
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Login attempt with:", emailOrUsername);
      
      let response: AuthTokenResponse;
      
      // Check if input is an email or username
      if (isEmail(emailOrUsername)) {
        // Login with email
        console.log("Logging in with email");
        response = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password,
        });
      } else {
        // Login with username - we need to find the email first
        console.log("Logging in with username");
        
        // Get email by username
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single();
        
        if (fetchError || !data) {
          console.error("Error fetching user by username:", fetchError);
          throw new Error("User not found. Check your username and try again.");
        }
        
        // Login with the retrieved email
        response = await supabase.auth.signInWithPassword({
          email: data.email,
          password,
        });
      }
      
      const { data, error } = response;
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful, user:", !!data.user);
      
      // Check admin status after successful login
      if (data.user) {
        const adminStatus = await checkAdminStatus(data.user.id);
        setIsAdmin(adminStatus);
      }
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    username: string,
    email: string,
    phone: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Signing up with:", username, email, phone);
      
      // Check if username is already taken
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();
        
      if (userCheckError) {
        console.error("Error checking existing username:", userCheckError);
      }
      
      if (existingUser) {
        throw new Error("Username is already taken. Please choose another one.");
      }
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone,
          },
        },
      });
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Signup successful, user:", !!data.user);
      
      // New users are not admins by default
      setIsAdmin(false);
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAdmin(false); // Reset admin status on logout
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const value = {
    isAuthenticated: !!user || isAdmin, // Consider admin as authenticated
    user,
    session,
    isLoading,
    isAdmin,
    login,
    signup,
    logout,
    resetPassword,
    setIsAdmin: setAdminStatus, // Use the new async function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
