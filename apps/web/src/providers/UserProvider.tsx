import { jwtDecode } from 'jwt-decode';
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import useLocalStorage from '@/hooks/useLocaleStorage';

interface UserSession {
  id: string;
  email: string;
  role: string;
  token: string;
}

interface UserContextType {
  user: UserSession | null;
  removeToken: () => void;
  setToken: (newToken: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children?: ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [token, setToken] = useLocalStorage('token');

  const removeToken = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const getDecodedToken = useCallback(() => {
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (!decoded.exp || decoded.exp < currentTime) {
        return null;
      }

      return decoded;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    const decoded = getDecodedToken();

    if (!decoded && token) {
      removeToken();
    }
  }, [getDecodedToken, token, removeToken]);

  const user = useMemo<UserSession | null>(() => {
    const decoded = getDecodedToken();

    if (!decoded) return null;

    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      token: token as string,
    };
  }, [getDecodedToken, token]);

  const contextValue = useMemo(
    () => ({
      user,
      removeToken,
      setToken,
    }),
    [user, removeToken, setToken]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
