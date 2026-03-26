import { House, LayoutDashboard, LucideIcon, Users } from 'lucide-react';
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
  role?: string;
}

export function NavLink() {
  const { user } = useUser();

  const links: Record<string, NavLinkItem> = {
    mySpace: { path: 'my-space', label: 'Mon Espace', icon: House },
    home: {
      path: 'my-ideoramas',
      label: 'Mes Idéoramas',
      icon: LayoutDashboard,
    },
    userHandling: {
      path: 'userHandling',
      label: 'Gestion stagiaires',
      icon: Users,
      role: 'SUPERVISOR',
    },
  };

  return (
    <SidebarMenu className="h-fit">
      {Object.entries(links)
        .filter(([_, link]) => !link.role || user?.role === link.role)
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
