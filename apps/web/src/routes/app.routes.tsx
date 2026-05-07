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
    element: <Ideoramas />,
    exact: true,
  },
  {
    path: 'my-space',
    element: <MySpace />,
    handle: { isCanvas: true },
  },
  {
    path: 'profile',
    element: <ProfilePage />,
  },
  {
    path: 'profile/:userId',
    element: <Profile />,
  },
  { path: 'ideorama', element: <Ideorama /> },
  {
    path: 'ideorama/:ideoramaid',
    element: <Ideorama />,
    handle: { isCanvas: true },
  },
  {
    path: 'my-ideoramas',
    element: <MyIdeoramas />,
  },
  {
    path: 'my-models',
    element: <MyModels />,
  },

  {
    path: 'text-editor',
    children: [
      { index: true, element: <TextEditor /> },
      {
        path: ':documentId',
        element: <EditorPage />,
        handle: { isCanvas: true },
      },
    ],
  },
  {
    path: 'audio-editor',
    element: <AudioEditor />,
  },
  {
    path: 'my-ideas',
    element: <MyIdeas />,
  },
  {
    path: 'voxel',
    children: [
      { index: true, element: <VoxelLayout />, handle: { isCanvas: true } },
      {
        path: ':modelId',
        element: <VoxelLayout />,
        handle: { isCanvas: true },
      },
    ],
  },
  {
    path: 'users',
    element: (
      <ProtectedRoute
        element={<UserHandling />}
        roles={['ADMIN', 'SUPERVISOR']}
      />
    ),
  },
  {
    path: 'assets',
    element: <ProtectedRoute element={<AssetHandling />} roles={['ADMIN']} />,
  },

  {
    path: 'settings',
    element: <ProtectedRoute element={<Settings />} roles={['ADMIN']} />,
  },
];

export default appRoutes;
