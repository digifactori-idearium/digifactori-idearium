import AuthPage from '@/pages/Auth';
import Home from '@/pages/Home';
import ProfilePage from '@/pages/Profile';
import TestFormPage from '@/pages/TestForm';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  { path: 'auth', element: <AuthPage /> },
  {path: 'profile', element: <ProfilePage/>},
  { path: 'testform', element: <TestFormPage /> },
];

export default publicRoutes;
