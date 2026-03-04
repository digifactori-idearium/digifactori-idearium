import Home from '@/pages/Home';
import Rooms from '@/pages/Rooms';
import RoomsPlayground from '@/pages/RoomsPlayground';
import Voxel from '@/pages/Voxel';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  {
    path: 'rooms',
    children: [
      { index: true, element: <Rooms /> },
      { path: 'playground', element: <RoomsPlayground /> },
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
