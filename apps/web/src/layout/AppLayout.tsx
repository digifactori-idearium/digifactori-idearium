import { Outlet, useMatches } from 'react-router-dom';

import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function AppLayout({ header }: { header: React.ReactElement }) {
  const matches = useMatches();
  const isCanvas = matches.some((m: any) => m.handle?.isCanvas);

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
          className={`box-content bg-sidebar flex-1 flex justify-center z-0 ${
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
