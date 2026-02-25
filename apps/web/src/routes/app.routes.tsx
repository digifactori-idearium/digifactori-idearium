import ProtectedRoute from './protected.routes';

import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/Profile';

const appRoutes = [
  {
    path: '',
    element: <ProtectedRoute element={<Dashboard />} />,
    exact: true,
  },
  {
    path: 'profile',
    element: <ProtectedRoute element={<ProfilePage />} />,
  },
];

export default appRoutes;
