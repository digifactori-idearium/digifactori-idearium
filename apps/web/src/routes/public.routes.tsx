import Home from '@/pages/Home';
import { Room } from "@/pages/myPages.tsx";
import TestFormPage from '@/pages/TestForm';

const publicRoutes = [
  { path: '', element: <Home />, exact: true },
  { path: 'testform', element: <TestFormPage /> },
  {path: 'room', element: <Room/>}
];

export default publicRoutes;
