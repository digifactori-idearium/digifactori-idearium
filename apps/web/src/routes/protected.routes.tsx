import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useUser } from '@/providers/UserProvider';
import axios from '@/services/axios.service';

interface ProtectedRouteProps {
  role?: string;
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, element }) => {
  const { getUser, removeToken } = useUser();
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    axios.interceptors.request.use(config => {
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    });

    axios.interceptors.response.use(
      response => response,
      error => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          removeToken();
          navigate('/');
        }

        if (error.response.status === 403) {
          navigate('/');
        }

        return Promise.reject(error);
      }
    );
  }, [user, removeToken, navigate]);

  if (!user || !user.token) {
    navigate('/');
    toast.warning("Vous n'êtes pas connecté");
    return null;
  }

  if (role && user.role !== role) {
    navigate('/');
    toast.error('Vous ne pouvez pas accéder à cette page.');
    return null;
  }

  return element;
};

export default ProtectedRoute;
