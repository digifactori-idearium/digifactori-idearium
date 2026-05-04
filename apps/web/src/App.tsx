import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ThemeProvider } from './providers/theme-provider';
import routes from './routes';

import './app.css';

const router = createBrowserRouter(routes);

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
