
import { AuthProvider } from './AuthProvider';
import { useAuthContext } from './useAuthContext';
import type { User, UserMetadata, AuthContextProps } from './types';

// Export the hook as useAuth for backward compatibility
const useAuth = useAuthContext;

export {
  AuthProvider,
  useAuth,
  useAuthContext
};

export type {
  User,
  UserMetadata,
  AuthContextProps
};
