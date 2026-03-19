import ProtectedRoute from './protected.routes';

import BatchRegister from '@/components/auth';
import Ideorama from '@/pages/Ideorama';
import Ideoramas from '@/pages/Ideoramas';
import MyIdeoramas from '@/pages/MyIdeoramas';
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
    path: 'ideorama/:ideoramaid',
    element: <ProtectedRoute element={<Ideorama />} />,
  },
  {
    path: 'myIdeoramas',
    element: <ProtectedRoute element={<MyIdeoramas />} />,
  },
  {
    path: 'batch_register',
    element: <ProtectedRoute element={<BatchRegister />} />,
  },
  { path: 'voxel', element: <ProtectedRoute element={<Voxel mode="add" shape="cube" rotation={0}/>} /> },
];

export default appRoutes;
