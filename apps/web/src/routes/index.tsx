import appRoutes from './app.routes';
import publicRoutes from './public.routes';

import { AppHeader } from '@/components/header';
import { Layout, AppLayout } from '@/layout';
import { RootLayout } from '@/layout';
import NotFound from '@/pages/NotFound';

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
      {
        path: '*',
        element: <Layout />,
        children: [
          {
            path: '*',
            element: <NotFound />, //should be last
          },
        ],
      },
    ],
  },
];

export default routes;
