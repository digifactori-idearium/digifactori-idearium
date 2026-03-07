import Home from '@/pages/Home';
import Ideoramas from '@/pages/Ideoramas';
import IdeoramasPlayground from '@/pages/IdeoramasPlayground';
import Voxel from '@/pages/Voxel';

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
      { index: true, element: <Voxel /> },
      { path: 'playground', element: <Voxel /> },
    ],
  },
];

export default publicRoutes;
