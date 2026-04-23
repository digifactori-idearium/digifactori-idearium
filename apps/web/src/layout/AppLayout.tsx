import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function AppLayout({ header }: { header: React.ReactElement }) {
  const location = useLocation();
  const paths = location.pathname.split('/');
  const isCanvas = paths.includes('ideorama') || paths.includes('my-space');
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
      {/* Main content area */}
      <SidebarInset className="flex flex-col min-h-screen w-full relative bg-sidebar">
        {/* Header is sticky */}
        {header}
        <main
          className={`min-h-[calc(100vh - 100px)] bg-sidebar flex-1 flex items-center justify-center ${isCanvas ? 'p-0' : 'p-4 md:p-6'} z-0`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
