import Home from '@/pages/Home';
import EmptyRoom from '@/pages/myPage';
import Rooms from '@/pages/Rooms';
import RoomsPlayground from '@/pages/RoomsPlayground';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  {
    path: 'rooms',
    children: [
      { index: true, element: <Rooms /> },
      { path: 'playground', element: <RoomsPlayground /> },
      { path: 'myroom', element: <EmptyRoom /> },
    ],
  },
];

export default publicRoutes;
