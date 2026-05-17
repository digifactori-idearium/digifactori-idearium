import { Outlet } from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import UserProvider from '@/providers/UserProvider';

export const RootLayout = () => (
  <UserProvider>
    <TooltipProvider>
      <Toaster position="top-right" richColors closeButton />
      <Outlet />
    </TooltipProvider>
  </UserProvider>
);
