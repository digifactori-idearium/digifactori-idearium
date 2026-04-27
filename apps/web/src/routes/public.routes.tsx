import Home from '@/pages/Home';
import Ideoramas from '@/pages/Ideoramas';
import Profile from '@/pages/Profile';
import VoxelLayout from '@/pages/VoxelLayout';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  {
    path: 'ideoramas',
    children: [{ index: true, element: <Ideoramas /> }],
  },
  {
    path: 'voxel',
    children: [
      { index: true, element: <VoxelLayout /> },
      { path: 'playground', element: <VoxelLayout /> },
    ],
  },
  {
    path: 'profile/:userId',
    element: <Profile />,
  },
];

export default publicRoutes;
