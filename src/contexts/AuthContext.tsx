
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

// Define user type
interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  isAuthenticated: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Check for session on mount and setup auth listener
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession);

        if (currentSession?.user) {
          try {
            // Get user profile data from the database
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();

            if (error) {
              console.error("Error fetching user data:", error);
              setUser(null);
            } else if (userData) {
              setUser({
                id: userData.id,
                username: userData.username,
                email: userData.email,
                phone: userData.phone,
                isAdmin: userData.is_admin || false
              });
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
          }
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setSupabaseUser(initialSession?.user ?? null);
      setIsAuthenticated(!!initialSession);

      if (initialSession?.user) {
        // Get user profile data from the database
        setTimeout(async () => {
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', initialSession.user.id)
              .single();

            if (error) {
              console.error("Error fetching user data:", error);
            } else if (userData) {
              setUser({
                id: userData.id,
                username: userData.username,
                email: userData.email,
                phone: userData.phone,
                isAdmin: userData.is_admin || false
              });
            }
          } catch (error) {
            console.error("Error fetching initial user data:", error);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  const signup = async (username: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      // Check if email already exists in auth.users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        toast({
          title: "Signup failed",
          description: "Email already registered",
          variant: "destructive",
        });
        return false;
      }

      // Check if username already exists
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUsername) {
        toast({
          title: "Signup failed",
          description: "Username already taken",
          variant: "destructive",
        });
        return false;
      }

      // Check if phone already exists
      const { data: existingPhone } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', phone)
        .single();

      if (existingPhone) {
        toast({
          title: "Signup failed",
          description: "Phone number already registered",
          variant: "destructive",
        });
        return false;
      }

      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone
          }
        }
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Signup successful",
        description: `Welcome to NexusArena, ${username}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser, 
      session, 
      login, 
      signup, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
