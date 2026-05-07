import { House, LogOutIcon, Moon, Rocket, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  SuperButton,
  VoiceButton,
  VoiceLink,
} from '@/components/common/button';
import AlertDialog from '@/components/dialog/AlertDialog';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/providers/theme-provider';
import { useUser } from '@/providers/UserProvider';

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { removeToken } = useUser();
  const navigate = useNavigate();

  const handleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const onLogout = () => {
    removeToken();
    navigate('/');
  };

  return (
    <div className="sticky top-0 z-100 bg-sidebar">
      <header className="bg-background flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
          <div className="flex w-full items-center gap-1">
            <SidebarTrigger className="-ml-1 side-btn text-foreground!" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <VoiceLink
              to=""
              voiceText="Mon Espace"
              className="text-base text-foreground! hover:text-foreground/80! font-medium flex items-center gap-1.5"
            >
              <House className="h-5" />{' '}
              <span className="text-base">Acceuil</span>
            </VoiceLink>
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <VoiceLink
              to="my-space"
              voiceText="Mon Espace"
              className="text-base text-foreground! hover:text-foreground/80! font-medium flex items-center gap-1.5"
            >
              <Rocket className="h-5" />{' '}
              <span className="text-base">Mon Espace</span>
            </VoiceLink>
          </div>

          <AlertDialog
            trigger={
              <VoiceButton
                className="side-btn text-foreground! flex gap-2"
                voiceText="Me déconnecter"
              >
                <LogOutIcon className="w-5 h-5 text-red-500" />
                <span className="hidden sm:inline">Me déconnecter</span>
              </VoiceButton>
            }
            description="Êtes-vous sûr de vouloir quitter votre session ? Vous
                      devrez vous reconnecter pour accéder à vos données."
            confirmationMessage="Se déconnecter"
            onConfirm={onLogout}
            onCancel={() => {}}
          />
          <div className="flex gap-1 md:gap-2">
            <SuperButton
              tooltip="Changez le theme"
              voiceText={`Changez le theme en ${theme === 'dark' ? 'blanc' : 'noir'}`}
              onClick={handleTheme}
              className="side-btn"
            >
              {theme === 'dark' ? (
                <Sun className="text-foreground! w-5! h-5!" />
              ) : (
                <Moon className="text-foreground! w-5! h-5!" />
              )}
            </SuperButton>
          </div>
        </div>
      </header>
    </div>
  );
}
