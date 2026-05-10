import Home from '@/pages/Home';
import Ideoramas from '@/pages/Ideoramas';
import NotFound from '@/pages/NotFound';
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
  {
    path: 'not-found',
    element: <NotFound />,
  },
];

export default publicRoutes;
