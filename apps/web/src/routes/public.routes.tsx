import AuthPage from '@/pages/Auth';
import Home from '@/pages/Home';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  { path: 'auth', element: <AuthPage /> },
];

export default publicRoutes;
