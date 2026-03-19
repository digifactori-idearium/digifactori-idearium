import ProtectedRoute from './protected.routes';

import BatchRegister from '@/components/auth';
import AudioEditor from '@/pages/AudioEditor';
import Ideorama from '@/pages/Ideorama';
import Ideoramas from '@/pages/Ideoramas';
import MyIdeas from '@/pages/MyIdeas';
import MyIdeoramas from '@/pages/MyIdeoramas';
import MySpace from '@/pages/MySpace';
import ProfilePage from '@/pages/Profile';
import TextEditor from '@/pages/TextEditor';
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
  { path: 'voxel', element: <ProtectedRoute element={<Voxel />} /> },
  { path: 'my-space', element: <ProtectedRoute element={<MySpace />} /> },
  { path: 'text-editor', element: <ProtectedRoute element={<TextEditor />} /> },
  {
    path: 'audio-editor',
    element: <ProtectedRoute element={<AudioEditor />} />,
  },
  {
    path: 'my-Ideas',
    element: <ProtectedRoute element={<MyIdeas />} />,
  },
];

export default appRoutes;
