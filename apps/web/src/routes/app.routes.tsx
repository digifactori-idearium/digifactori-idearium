import ProtectedRoute from './protected.routes';

import AssetHandling from '@/components/assets-table/assetsHandling';
import UserHandling from '@/components/users/userHandling';
import AudioEditor from '@/pages/AudioEditor';
import Ideorama from '@/pages/Ideorama';
import Ideoramas from '@/pages/Ideoramas';
import MyIdeas from '@/pages/MyIdeas';
import MyIdeoramas from '@/pages/MyIdeoramas';
import MyModels from '@/pages/MyModels';
import ProfilePage from '@/pages/MyProfile';
import MySpace from '@/pages/MySpace';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import { EditorPage, TextEditor } from '@/pages/TextEditor';
import VoxelLayout from '@/pages/VoxelLayout';

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
  {
    path: 'profile/:userId',
    element: <ProtectedRoute element={<Profile />} />
  },
  { path: 'ideorama', element: <ProtectedRoute element={<Ideorama />} /> },
  {
    path: 'ideorama/:ideoramaid',
    element: <ProtectedRoute element={<Ideorama />} />,
    handle: { isCanvas: true },
  },
  {
    path: 'my-ideoramas',
    element: <ProtectedRoute element={<MyIdeoramas />} />,
  },
  {
    path: 'my-models',
    element: <ProtectedRoute element={<MyModels />} />,
  },
  {
    path: 'users',
    element: <ProtectedRoute element={<UserHandling />} />,
  },
  {
    path: 'assets',
    element: <ProtectedRoute element={<AssetHandling />} />,
  },
  {
    path: 'my-space',
    element: <ProtectedRoute element={<MySpace />} />,
    handle: { isCanvas: true },
  },
  {
    path: 'text-editor',
    children: [
      { index: true, element: <ProtectedRoute element={<TextEditor />} /> },
      {
        path: ':documentId',
        element: <ProtectedRoute element={<EditorPage />} />,
        handle: { isCanvas: true },
      },
    ],
  },
  {
    path: 'audio-editor',
    element: <ProtectedRoute element={<AudioEditor />} />,
  },
  {
    path: 'my-ideas',
    element: <ProtectedRoute element={<MyIdeas />} />,
  },
  {
    path: 'voxel',
    children: [
      { index: true, element: <ProtectedRoute element={<VoxelLayout />} /> },
      {
        path: ':modelId',
        element: <ProtectedRoute element={<VoxelLayout />} />,
        handle: { isCanvas: true },
      },
    ],
  },
  { path: 'settings', element: <ProtectedRoute element={<Settings />} /> },
];

export default appRoutes;
