import { useEffect } from 'react';
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useUser } from '@/providers/UserProvider';

export function AppLayout({ header }: { header: React.ReactElement }) {
  const matches = useMatches();
  const isCanvas = matches.some((m: any) => m.handle?.isCanvas);
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = !!user?.token;

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning("Vous n'êtes pas connecté", { id: 'not-auth' });
      navigate('/', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, location, navigate]);

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '12rem',
          '--sidebar-width-mobile': '8rem',
        } as React.CSSProperties
      }
      defaultOpen={!isCanvas}
    >
      <AppSidebar collapsible="offcanvas" />
      <SidebarInset
        className={`flex flex-col w-full relative bg-sidebar ${
          isCanvas ? 'h-screen overflow-hidden' : 'min-h-screen'
        }`}
      >
        <div className="flex-none">{header}</div>
        <main
          className={`flex-1 flex justify-center z-0 min-h-0 ${
            isCanvas ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-6'
          }`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
