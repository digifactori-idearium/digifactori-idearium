import appRoutes from './app.routes';
import publicRoutes from './public.routes';

import { AppHeader } from '@/components/header';
import { Layout, AppLayout } from '@/layout';
import { RootLayout } from '@/layout';

const routes = [
  {
    element: <RootLayout />,
    children: [
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
    ],
  },
];

export default routes;
