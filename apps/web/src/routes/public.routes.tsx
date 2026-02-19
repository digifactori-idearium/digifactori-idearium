import Home from '@/pages/Home';
import TestFormPage from '@/pages/TestForm';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  { path: 'testform', element: <TestFormPage /> },
];

export default publicRoutes;
