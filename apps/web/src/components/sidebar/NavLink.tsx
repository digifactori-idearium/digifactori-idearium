import { House, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavLink() {
  const links = {
    home: { path: '', label: 'Ideoramas', icon: LayoutDashboard },
    mySpace: { path: 'my-space', label: 'Mon Espace', icon: House },
  };

  return (
    <SidebarMenu className="h-fit">
      {Object.entries(links).map(([key, link]) => (
        <SidebarMenuItem key={key} className="my-1">
          <SidebarMenuButton asChild className="h-auto!">
            <Link to={link.path} className=" flex flex-col text-foreground!">
              <div className="form-icon">
                <link.icon size={32} className=" text-white" />
              </div>
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
