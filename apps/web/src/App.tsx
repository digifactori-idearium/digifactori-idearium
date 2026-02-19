import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ThemeProvider } from './providers/theme-provider';
import UserProvider from './providers/UserProvider';
import routes from './routes';

import { TooltipProvider } from '@/components/ui/tooltip';
import './app.css';

const router = createBrowserRouter(routes);

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <UserProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
