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
    const requestUrl = error.config?.url ?? '';
    const isAuthRoute = requestUrl.includes('/auth/');

    if ((status === 401 || status === 403) && !isAuthRoute) {
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', { detail: { status } })
      );
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
