import Home from '@/pages/Home';
import Ideoramas from '@/pages/Ideoramas';
import IdeoramasPlayground from '@/pages/IdeoramasPlayground';
import VoxelLayout from '@/pages/VoxelLayout';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  {
    path: 'ideoramas',
    children: [
      { index: true, element: <Ideoramas /> },
      { path: 'playground', element: <IdeoramasPlayground /> },
    ],
  },
  {
    path: 'voxel',
    children: [
      { index: true, element: <VoxelLayout /> },
      { path: 'playground', element: <VoxelLayout /> },
    ],
  },
];

export default publicRoutes;
