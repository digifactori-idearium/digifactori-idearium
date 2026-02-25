import ProtectedRoute from './protected.routes';

import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/Profile';
import Room from '@/pages/Room';

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
  { path: 'room', element: <ProtectedRoute element={<Room />} /> },
];

export default appRoutes;
