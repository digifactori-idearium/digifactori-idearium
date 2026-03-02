import ProtectedRoute from './protected.routes';

import ProfilePage from '@/pages/Profile';
import Room from '@/pages/Room';
import RoomCopy from '@/pages/RoomCopy';
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
  { path: 'roomCopy', element: <ProtectedRoute element={<RoomCopy />} /> },
];

export default appRoutes;
