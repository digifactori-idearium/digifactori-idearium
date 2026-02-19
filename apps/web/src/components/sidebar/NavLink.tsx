import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavLink() {
  const links = {
    home: { path: '', label: 'Rooms', icon: LayoutDashboard },
  };

  return (
    <SidebarMenu>
      {Object.entries(links).map(([key, link]) => (
        <SidebarMenuItem key={key} className="my-1">
          <SidebarMenuButton asChild>
            <Link to={link.path} className=" text-foreground!">
              <link.icon size={24} className="me-2" />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
