import { Outlet } from 'react-router-dom';

import AuthModal from '@/components/auth';
import { Header } from '@/components/header';
import AuthProvider from '@/providers/AuthProvider';

export function Layout() {
  return (
    <AuthProvider>
      <div className="relative bg-sidebar! flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          {/* <div className="relative w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center"> */}
          <Outlet />
          <AuthModal />
          {/* </div> */}
        </main>
      </div>
    </AuthProvider>
  );
}
