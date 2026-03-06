import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function AppLayout({ header }: { header: React.ReactElement }) {
  const location = useLocation();
  const isIdeorama = location.pathname.split('/').includes('ideorama');
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '12rem',
          '--sidebar-width-mobile': '8rem',
        } as React.CSSProperties
      }
      defaultOpen={!isIdeorama}
    >
      <AppSidebar collapsible="offcanvas" />
      {/* Main content area */}
      <SidebarInset className="flex flex-col min-h-screen w-full relative bg-sidebar">
        {/* Header is sticky */}
        {header}
        <main
          className={`min-h-[calc(100vh - 100px)] bg-sidebar flex-1 flex items-center justify-center ${isIdeorama ? 'p-0' : 'p-4'}z-0`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
