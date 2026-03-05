import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useUser } from '@/providers/UserProvider';

interface ProtectedRouteProps {
  role?: string;
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, element }) => {
  const { getUser } = useUser();
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user || !user.token) {
      toast.warning("Vous n'êtes pas connecté", { id: 'not-auth' });
      navigate('/');
    } else if (role && user.role !== role) {
      toast.error('Vous ne pouvez pas accéder à cette page.', {
        id: 'not-allowed',
      });
      navigate('/');
    }
  }, [user, role, navigate]);

  if (!user || !user.token) return null;
  if (role && user.role !== role) return null;

  return element;
};
export default ProtectedRoute;
