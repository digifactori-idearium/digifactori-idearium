import { Layout, AppLayout } from '@/layout';
import appRoutes from './app.routes';
import publicRoutes from './public.routes';
import { AppHeader } from '@/components/header';
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [...publicRoutes],
  },
  {
    path: '/app',
    element: <AppLayout header={<AppHeader />} />,
    children: [...appRoutes],
  },
];

export default routes;
