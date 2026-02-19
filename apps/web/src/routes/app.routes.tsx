import Dashboard from '@/pages/Dashboard';
import UpdateProfilePage from '../pages/UpdateProfile';

const appRoutes = [
    {path: '', element: <Dashboard />, exact: true },
    {path: 'profile/update', element: <UpdateProfilePage />, exact: true },
];

export default appRoutes;
