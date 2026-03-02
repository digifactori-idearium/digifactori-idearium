import ProtectedRoute from './protected.routes';

import ProfilePage from '@/pages/Profile';
import Room from '@/pages/Room';
import Voxel from '@/pages/Voxel';
import Rooms from '@/pages/Rooms';

const appRoutes = [
  {
    path: '',
    element: <ProtectedRoute element={<Rooms />} />,
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
