import Home from '@/pages/Home';
import AuthPage from '@/pages/Auth';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  { path: 'auth', element: <AuthPage /> },
];

export default publicRoutes;
