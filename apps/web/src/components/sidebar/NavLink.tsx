import {
  LucideIcon,
  Users,
  Box,
  Settings,
  NotebookText,
  Cuboid,
  Rocket,
  SolarPanel,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUser } from '@/providers/UserProvider';

interface NavLinkItem {
  path: string;
  label: string;
  icon: LucideIcon;
  role?: string[];
}

export function NavLink() {
  const { user } = useUser();

  const links: Record<string, NavLinkItem> = {
    mySpace: { path: 'my-space', label: 'Mon Espace', icon: Rocket },
    home: {
      path: 'my-ideoramas',
      label: 'Mes Idéoramas',
      icon: SolarPanel,
    },
    myModels: {
      path: 'my-models',
      label: 'Mes Modèles',
      icon: Cuboid,
    },

    textEditor: {
      path: 'text-editor',
      label: 'Éditeur Texte',
      icon: NotebookText,
    },
    userHandling: {
      path: 'users',
      label: 'Gestion Utilisateurs',
      icon: Users,
      role: ['SUPERVISOR', 'ADMIN'],
    },
    assetHandling: {
      path: 'assets',
      label: 'Gestion assets',
      icon: Box,
      role: ['ADMIN'],
    },
    settings: {
      path: 'settings',
      label: 'Paramètres',
      icon: Settings,
      role: ['ADMIN'],
    },
  };

  return (
    <SidebarMenu className="h-fit">
      {Object.entries(links)
        .filter(([_, link]) => {
          if (!link.role) return true;

          if (!user?.role) return false;

          return link.role.includes(user.role);
        })
        .map(([key, link]) => (
          <SidebarMenuItem key={key} className="my-1">
            <SidebarMenuButton asChild className="h-auto!">
              <Link to={link.path} className="flex flex-col text-foreground!">
                <div className="form-icon">
                  <link.icon size={32} className="text-white" />
                </div>
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );
}
