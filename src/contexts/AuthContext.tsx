
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  isAuthenticated: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Mock user storage for demo purposes
const USERS_STORAGE_KEY = 'nexus_arena_users';
const AUTH_USER_KEY = 'nexus_arena_current_user';

// Initial admin user
const ADMIN_USER = {
  id: "admin-001",
  username: "Sandeep",
  email: "sandeep.wpwb@gmail.com",
  phone: "+91 12345 67890",
  isAdmin: true
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize the users array with the admin user if it doesn't exist
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([ADMIN_USER]));
    }
  }, []);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }, []);

  const getUsers = (): User[] => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (e) {
        return [ADMIN_USER];
      }
    }
    return [ADMIN_USER];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Admin special case
    if (email === ADMIN_USER.email && password === "123456789") {
      setUser(ADMIN_USER);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(ADMIN_USER));
      
      toast({
        title: "Admin Login successful",
        description: `Welcome back, ${ADMIN_USER.username}!`,
      });
      
      return true;
    }
    
    const users = getUsers();
    const validUser = users.find(u => u.email === email);
    
    if (!validUser) {
      toast({
        title: "Login failed",
        description: "No account found with this email",
        variant: "destructive",
      });
      return false;
    }
    
    // In a real app, you would hash the password and compare with the stored hash
    // For this demo, we'll assume the password matches
    setUser(validUser);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(validUser));
    
    toast({
      title: "Login successful",
      description: `Welcome back, ${validUser.username}!`,
    });
    
    return true;
  };

  const signup = async (username: string, email: string, phone: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      toast({
        title: "Signup failed",
        description: "Username already taken",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      toast({
        title: "Signup failed",
        description: "Email already registered",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if phone already exists
    if (users.some(u => u.phone === phone)) {
      toast({
        title: "Signup failed",
        description: "Phone number already registered",
        variant: "destructive",
      });
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      phone,
      isAdmin: false,
    };
    
    // Save to "database"
    users.push(newUser);
    saveUsers(users);
    
    // Auto login after signup
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    
    toast({
      title: "Signup successful",
      description: `Welcome to NexusArena, ${username}!`,
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_USER_KEY);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
