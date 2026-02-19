import { ArrowRight, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

import logo from '../../assets/images/logo.png';
import { Button } from '../ui/button';

import { useTheme } from '@/providers/theme-provider';
import { useUser } from '@/providers/UserProvider';

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const handleTheme = () => {
    if (theme == 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }
  const user = useUser();
  
  ;
  return (
    <header
      className="sticky top-4 z-50 px-6 rounded-2xl mx-6 bg-[#51545c]/10  border-0 dark:border-2 
      bg-meta-darkBg/30 backdrop-blur-md supports-backdrop-filter:bg-meta-darkBg/30"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="relative h-10 w-10">
            {/* Using the logo provided */}
            <img
              src={logo}
              alt="Idearium Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-foreground hidden font-bold sm:inline-block text-xl tracking-wider">
            Idearium
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
          {/* Future navigation links can be added here */}
        </nav>

        <div className="flex items-center space-x-4">
          {user.getUser() && <Link
            to="/app/login"
            role="button"
            className="bg-background! text-foreground! hover:bg-background/90! relative group overflow-hidden px-4 py-2 rounded-2xl"
          > Log In </Link>}
          {!user.getUser() && <Link
            to="/app"
            role="button"
            className="bg-background! text-foreground! hover:bg-background/90! relative group overflow-hidden px-4 py-2 rounded-2xl"
          > Log Out </Link>}
          <Link
            to="/app/logout"
            role="button"
            className="bg-background! text-foreground! hover:bg-background/90! relative group overflow-hidden px-4 py-2 rounded-2xl"
          >
            <span className="relative z-10 flex items-center">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </span>
            {/* Subtle gradient hover effect on button */}
            <div className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-hover:scale-105 group-hover:bg-metatron-gradient opacity-20" />
          </Link>
          <div>
            <Button onClick={handleTheme} className="side-btn">
              {theme == 'dark' ? (
                <Sun className=" text-foreground! w-5! h-5!" />
              ) : (
                <Moon className=" text-foreground! w-5! h-5!" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
