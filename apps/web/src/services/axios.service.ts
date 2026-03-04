import axios from 'axios';
import { toast } from 'sonner';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  withCredentials: false,
});

instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

instance.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');

      toast.error('Session expirée. Veuillez vous reconnecter.', {
        id: 'session-expired',
      });

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    if (status === 403) {
      toast.error('Accès refusé.', {
        id: 'forbidden',
      });

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    if (status === 500) {
      toast.error('Erreur serveur. Réessayez plus tard.', {
        id: 'server-error',
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
