import ProtectedRoute from './protected.routes';

import BatchRegister from '@/components/auth';
import ProfilePage from '@/pages/Profile';
import Room from '@/pages/Room';
import RoomCopy from '@/pages/RoomCopy';
import Rooms from '@/pages/Rooms';
import Voxel from '@/pages/Voxel';

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
  { path: 'roomCopy', element: <ProtectedRoute element={<RoomCopy />} /> },
  {
    path: 'batch_register',
    element: <ProtectedRoute element={<BatchRegister />} />,
  },
  { path: 'voxel', element: <ProtectedRoute element={<Voxel />} /> },
];

export default appRoutes;
