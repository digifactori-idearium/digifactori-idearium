import { LogOutIcon, Moon, Sun, LogIn, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../../assets/images/logo.png';

import { VoiceButton } from '@/components/global';
import { SuperButton } from '@/components/global';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/theme-provider';
import { useUser } from '@/providers/UserProvider';

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const { removeToken } = useUser();
  const { openAuth } = useAuth();

  const handleTheme = () => {
    if (theme == 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const { user } = useUser();

  const navigate = useNavigate();

  const onLogout = () => {
    removeToken();
    navigate('/');
  };

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
            Idéarium
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
          {/* Future navigation links can be added here */}
        </nav>

        <div className="flex items-center space-x-4">
          {!user && (
            <VoiceButton
              onClick={() => {
                openAuth('login');
              }}
              role="button"
              voiceText="Se connecter à Idéarium"
              className="bg-background! text-foreground! hover:bg-background/90! relative group overflow-hidden px-4 py-2 rounded-2xl"
            >
              Se connecter <LogIn />{' '}
            </VoiceButton>
          )}
          {user && (
            <div className="flex gap-1 md:gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <VoiceButton
                    voiceText="Me déconnecter"
                    className="side-btn text-foreground! flex gap-2"
                  >
                    <LogOutIcon className="w-5 h-5 text-red-500" />
                    <span className="hidden sm:inline">Me déconnecter</span>
                  </VoiceButton>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-4xl border-mauve! bg-sidebar!  shadow-2xl p-8">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir quitter votre session ? Vous
                      devrez vous reconnecter pour accéder à vos données.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="form-button p-4">
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onLogout}
                      className="danger-btn"
                    >
                      Se déconnecter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {user && (
            <Link
              to="/app/my-space"
              role="button"
              className="bg-background! text-foreground! hover:bg-background/90! relative group overflow-hidden px-4 py-2 rounded-2xl"
            >
              <span className="relative z-10 flex items-center">
                <span className="hidden sm:inline">Se lancer</span>
                <Play className="ml-2 h-4 w-4" />
              </span>
              {/* Subtle gradient hover effect on button */}
              <div className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-hover:scale-105 group-hover:bg-metatron-gradient opacity-20" />
            </Link>
          )}

          <div>
            <SuperButton
              tooltip="Changez le theme"
              voiceText={`Changez le theme en ${theme === 'dark' ? 'blanc' : 'noir'}`}
              onClick={handleTheme}
              className="side-btn"
            >
              {theme == 'dark' ? (
                <Sun className=" text-foreground! w-5! h-5!" />
              ) : (
                <Moon className=" text-foreground! w-5! h-5!" />
              )}
            </SuperButton>
          </div>
        </div>
      </div>
    </header>
  );
};
