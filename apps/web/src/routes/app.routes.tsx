import ProtectedRoute from './protected.routes';

import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/Profile';
import Room from '@/pages/Room';
import Voxel from '@/pages/Voxel';

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
  { path: 'voxel', element: <ProtectedRoute element={<Voxel />} /> },
];

export default appRoutes;
