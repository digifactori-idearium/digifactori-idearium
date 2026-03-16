import ProtectedRoute from './protected.routes';

import BatchRegister from '@/components/auth';
import Ideorama from '@/pages/Ideorama';
import IdeoramaCopy from '@/pages/IdeoramaCopy';
import Ideoramas from '@/pages/Ideoramas';
import MySpace from '@/pages/MySpace';
import ProfilePage from '@/pages/Profile';
import Voxel from '@/pages/Voxel';

const appRoutes = [
  {
    path: '',
    element: <ProtectedRoute element={<Ideoramas />} />,
    exact: true,
  },
  {
    path: 'profile',
    element: <ProtectedRoute element={<ProfilePage />} />,
  },
  { path: 'ideorama', element: <ProtectedRoute element={<Ideorama />} /> },
  {
    path: 'ideoramaCopy',
    element: <ProtectedRoute element={<IdeoramaCopy />} />,
  },
  {
    path: 'batch_register',
    element: <ProtectedRoute element={<BatchRegister />} />,
  },
  { path: 'voxel', element: <ProtectedRoute element={<Voxel />} /> },
  { path: 'my-space', element: <ProtectedRoute element={<MySpace />} /> },
];

export default appRoutes;
