import Home from '@/pages/Home';
import Ideoramas from '@/pages/Ideoramas';
import Profile from '@/pages/Profile';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  {
    path: 'ideoramas',
    children: [{ index: true, element: <Ideoramas /> }],
  },
  {
    path: 'profile/:userId',
    element: <Profile />,
  },
];

export default publicRoutes;
