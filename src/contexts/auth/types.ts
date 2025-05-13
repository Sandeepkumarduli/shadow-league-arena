
import { ReactNode } from 'react';

export interface UserMetadata {
  username?: string;
  is_admin?: boolean;
}

export interface User {
  id: string;
  email: string;
  user_metadata: UserMetadata;
}

export interface AuthContextProps {
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

export interface AuthProviderProps {
  children: ReactNode;
}
