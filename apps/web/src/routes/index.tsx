import appRoutes from './app.routes';
import publicRoutes from './public.routes';

import { AppHeader } from '@/components/header';
import { Layout, AppLayout } from '@/layout';
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
