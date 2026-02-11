import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { Button } from '../ui/button';

export const Header = () => {
  return (
    <header
      className="sticky top-4 z-50 px-6 rounded-2xl mx-6 border-2 bg-[#51545c]/10
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
          <span className="text-white hidden font-bold sm:inline-block text-xl tracking-wider">
            Idearium
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
          {/* Future navigation links can be added here */}
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex border border-white! hover:border-blue-500!"
          >
            Log In
          </Button>
          <Link
            to="/app"
            role="button"
            className="bg-white! text-black! hover:bg-white/90! relative group overflow-hidden px-4 py-2 rounded-2xl"
          >
            <span className="relative z-10 flex items-center">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </span>
            {/* Subtle gradient hover effect on button */}
            <div className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-hover:scale-105 group-hover:bg-metatron-gradient opacity-20" />
          </Link>
        </div>
      </div>
    </header>
  );
};
