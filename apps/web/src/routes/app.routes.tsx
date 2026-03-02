import ProtectedRoute from './protected.routes';

import BatchRegister from '@/components/auth';
import ProfilePage from '@/pages/Profile';
import Room from '@/pages/Room';
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
  {
    path: 'batch_register',
    element: <ProtectedRoute element={<BatchRegister />} />,
  },
];

export default appRoutes;
