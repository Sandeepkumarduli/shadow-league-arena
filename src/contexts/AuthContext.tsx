
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
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, phone: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  login: async () => false,
  signup: async () => false,
  resetPassword: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isLoading: false,
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
        console.log("Auth state change event:", event);
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
              console.log("User data fetched:", userData);
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
      console.log("Initial session check:", initialSession ? "Session exists" : "No session");
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
              console.log("Initial user data:", userData);
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

  // Function to check if the input is an email
  const isEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with:", emailOrUsername);
      
      // Clean up input by trimming whitespace
      const cleanInput = emailOrUsername.trim();
      
      // Check if input is email or username
      let email = cleanInput;
      
      // If input is not an email, try to find the user by username
      if (!isEmail(cleanInput)) {
        console.log("Input appears to be a username, looking up email...");
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', cleanInput)
          .single();
          
        if (userError || !userData) {
          console.error("Username lookup error:", userError);
          toast({
            title: "Login failed",
            description: "Username not found",
            variant: "destructive",
          });
          return false;
        }
        
        email = userData.email;
        console.log("Found email for username:", email);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      console.log("Login successful:", data);
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
      // Ensure all fields are trimmed of whitespace
      const cleanUsername = username.trim();
      const cleanEmail = email.trim();
      const cleanPhone = phone.trim();
      
      console.log("Starting signup process for:", cleanEmail, "with username:", cleanUsername);
      
      // Validate the required fields are not empty
      if (!cleanUsername || !cleanEmail || !cleanPhone) {
        const missingFields = [];
        if (!cleanUsername) missingFields.push("username");
        if (!cleanEmail) missingFields.push("email");
        if (!cleanPhone) missingFields.push("phone");
        
        const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
        console.error(errorMsg);
        toast({
          title: "Signup failed",
          description: errorMsg,
          variant: "destructive",
        });
        return false;
      }
      
      // First, create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            phone: cleanPhone
          }
        }
      });

      if (error) {
        console.error("Signup auth error:", error);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (!data.user) {
        console.error("No user returned after signup");
        toast({
          title: "Signup failed",
          description: "User creation failed",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Auth signup successful, user created:", data.user);
      
      // Then manually insert into users table to ensure username and phone are set
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          id: data.user.id, 
          username: cleanUsername, 
          email: cleanEmail, 
          phone: cleanPhone,
          is_admin: false
        }]);
        
      if (insertError) {
        console.error("Error inserting user data:", insertError);
        
        // If users table insert fails, we should delete the auth user to maintain consistency
        // However, this may not be necessary if there's a trigger that handles this already
        
        toast({
          title: "Signup failed",
          description: "Failed to create user profile",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("User profile created successfully");
      toast({
        title: "Signup successful",
        description: `Welcome to NexusArena, ${cleanUsername}!`,
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

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const cleanEmail = email.trim();
      
      if (!cleanEmail) {
        toast({
          title: "Password reset failed",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return false;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        console.error("Password reset error:", error.message);
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Password reset email sent",
        description: "Check your inbox for further instructions",
      });
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
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
      resetPassword,
      logout, 
      isAuthenticated,
      isLoading: loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
