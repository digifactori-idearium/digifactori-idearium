import AuthPage from '@/pages/Auth';
import Home from '@/pages/Home';
import TestFormPage from '@/pages/TestForm';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  { path: 'auth', element: <AuthPage /> },
  { path: 'testform', element: <TestFormPage /> },
];

export default publicRoutes;
