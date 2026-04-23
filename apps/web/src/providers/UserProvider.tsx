import { jwtDecode } from 'jwt-decode';
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { toast } from 'sonner';

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

  // Handle expired token on load
  useEffect(() => {
    const decoded = getDecodedToken();

    if (!decoded && token) {
      toast.error('Session expirée. Veuillez vous reconnecter.', {
        id: 'session-expired',
      });
      removeToken();
    }
  }, [getDecodedToken, token, removeToken]);

  // Handle 401/403 from the custom event in axios
  useEffect(() => {
    const handleUnauthorized = (e: CustomEvent) => {
      const message =
        e.detail.status === 403
          ? 'Accès refusé.'
          : 'Session expirée. Veuillez vous reconnecter.';

      toast.error(message, { id: 'session-expired' });
      removeToken();

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    };

    window.addEventListener(
      'auth:unauthorized',
      handleUnauthorized as EventListener
    );
    return () =>
      window.removeEventListener(
        'auth:unauthorized',
        handleUnauthorized as EventListener
      );
  }, [removeToken]);

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
