import { Outlet } from 'react-router-dom';

import { AppSidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function AppLayout({ header }: { header: React.ReactElement }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '12rem',
          '--sidebar-width-mobile': '10rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      {/* Main content area */}
      <SidebarInset className="flex flex-col min-h-screen w-full relative bg-sidebar">
        {/* Header is sticky */}
        {header}
        <main className="min-h-[calc(100vh - 100px)] bg-sidebar flex-1 flex items-center justify-center p-4 z-0">
          <div className="relative w-full h-full flex items-center justify-center">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
