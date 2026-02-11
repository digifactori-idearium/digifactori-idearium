import { Outlet } from 'react-router-dom';

import { Header } from '@/components/header';

export function Layout() {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* <div className="relative w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center"> */}
        <Outlet />
        {/* </div> */}
      </main>
    </div>
  );
}
