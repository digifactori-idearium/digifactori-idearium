import Dashboard from '@/pages/Dashboard';
import LogOutPage from '@/pages/LogOut';

const appRoutes = [
    {path: '', element: <Dashboard />, exact: true },
    {path: '/logout', element: <LogOutPage />, exact: true },
];

export default appRoutes;
