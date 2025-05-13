
import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './useAuthContext';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { fetchCurrentUser } from '@/services/authService';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user data separately to avoid blocking auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchCurrentUser().then(userData => {
              if (userData) {
                setIsAdmin(userData.is_admin || false);
              }
            });
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchCurrentUser().then(userData => {
          if (userData) {
            setIsAdmin(userData.is_admin || false);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Could not log in',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Add admin login function for backward compatibility
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Check if user is admin after login
      const userData = await fetchCurrentUser();
      if (!userData?.is_admin) {
        toast({
          title: 'Access denied',
          description: 'You do not have admin privileges',
          variant: 'destructive',
        });
        await supabase.auth.signOut(); // Sign out if not admin
        return false;
      }
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Admin login failed',
        description: error.message || 'Could not log in',
        variant: 'destructive',
      });
      return false;
    }
  };

  const signup = async (email: string, password: string, username: string, phone: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone
          }
        }
      });
      if (error) throw error;
      
      toast({
        title: "Sign up successful",
        description: "Your account has been created.",
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Could not create account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message || 'Could not log out',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isAdmin,
        user,
        session,
        loading,
        isLoading: loading, // For backward compatibility
        login,
        signup,
        logout,
        adminLogin, // Added adminLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
