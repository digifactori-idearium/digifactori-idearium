import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/Profile';

const appRoutes = [
  { path: '', element: <Dashboard />, exact: true },
  { path: 'profile', element: <ProfilePage /> },
];

export default appRoutes;
