
import { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean; // Added loading property
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  // Adding adminLogin property for compatibility
  adminLogin?: (email: string, password: string) => Promise<boolean>;
  isLoading?: boolean; // For backward compatibility
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
