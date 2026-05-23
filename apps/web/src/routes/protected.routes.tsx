import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { useUser } from '@/providers/UserProvider';

interface ProtectedRouteProps {
  roles?: string[];
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, element }) => {
  const { user } = useUser();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  const isAuthorized = useMemo(() => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(user?.role ?? '');
  }, [roles, user]);

  useEffect(() => {
    if (!isAuthorized) {
      toast.error('Accès refusé', { id: 'not-allowed' });
    }
    setReady(true);
  }, [isAuthorized]);

  if (!ready) return null;

  if (!isAuthorized) {
    return <Navigate to="/app/my-space" state={{ from: location }} replace />;
  }

  return element;
};

export default ProtectedRoute;
