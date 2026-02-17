import AuthPage from '@/pages/Auth';
import Home from '@/pages/Home';
import ProfilePage from '@/pages/Profile';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  { path: 'auth', element: <AuthPage /> },
  {path: 'profile', element: <ProfilePage/>}
];

export default publicRoutes;
