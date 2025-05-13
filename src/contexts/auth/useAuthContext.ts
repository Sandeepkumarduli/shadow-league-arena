
import { createContext, useContext } from 'react';
import { AuthContextProps } from './types';

// Create the AuthContext
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// Custom hook to use the AuthContext
export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
