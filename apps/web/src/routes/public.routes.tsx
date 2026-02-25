import Home from '@/pages/Home';
import TestFormPage from '@/pages/TestForm';
import Rooms from '@/pages/Rooms';
import RoomsPlayground from '@/pages/RoomsPlayground';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  {
    path: 'rooms',
    children: [
      { index: true, element: <Rooms /> },
      { path: 'playground', element: <RoomsPlayground /> },
    ],
  },

  { path: 'testform', element: <TestFormPage /> },
];

export default publicRoutes;
