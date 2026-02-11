import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ThemeProvider } from './providers/theme-provider';
import routes from './routes';

import { TooltipProvider } from '@/components/ui/tooltip';
import './app.css';

const router = createBrowserRouter(routes);

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
