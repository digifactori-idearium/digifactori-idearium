import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import ErrorBoundary from '@/pages/Error';
import { ThemeProvider } from '@/providers/theme-provider';
import routes from '@/routes';
import './app.css';

const router = createBrowserRouter(routes);

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
