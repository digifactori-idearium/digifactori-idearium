import { jwtDecode } from 'jwt-decode';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import useLocalStorage from '@/hooks/useLocaleStorage';

interface UserContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  removeToken: () => void;
  setToken: (token: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

export default function UserProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useLocalStorage('token');
  const navigate = useNavigate();

  const removeToken = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const decodeToken = useCallback(() => {
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      const now = Date.now() / 1000;
      if (!decoded.exp || decoded.exp < now) return null;
      return decoded;
    } catch {
      return null;
    }
  }, [token]);

  // Expired/invalid token in storage
  useEffect(() => {
    const decoded = decodeToken();
    if (!decoded && token) {
      toast.error('Session expirée.', { id: 'session-expired' });
      removeToken();
      navigate('/', { replace: true });
    }
  }, [decodeToken, token, removeToken, navigate]);

  // 401 / 403 from axios interceptor
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const status = e.detail.status;

      if (status === 401) {
        toast.error('Session expirée.', { id: 'session-expired' });
        removeToken();
        navigate('/', { replace: true });
      }

      if (status === 403) {
        toast.error('Accès refusé.', { id: 'not-allowed' });
        navigate('/app/my-space', { replace: true });
      }
    };

    window.addEventListener('auth:unauthorized', handler as EventListener);
    return () =>
      window.removeEventListener('auth:unauthorized', handler as EventListener);
  }, [removeToken, navigate]);

  const user = useMemo(() => {
    const decoded = decodeToken();
    if (!decoded) return null;
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      voiceButtons: decoded.voiceButtons,
      token: token!,
    };
  }, [decodeToken, token]);

  return (
    <UserContext.Provider
      value={{ user, isAuthenticated: !!user, removeToken, setToken }}
    >
      {children}
    </UserContext.Provider>
  );
}
