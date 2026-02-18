import { CircleUser } from 'lucide-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { NavBrand } from './NavBrand';
import { NavLink } from './NavLink';
import { NavLinkSkeleton } from './NavSkeleton';

import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <NavBrand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <React.Suspense fallback={<NavLinkSkeleton />}>
              <NavLink />
            </React.Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <Link
            to="chat"
            role="button"
            className="flex justify-center items-center py-6 text-xl text-white! bg-[#6F51B0]! hover:bg-[#6F51B0]/80! rounded-4xl!"
          >
            <CircleUser className="h-6! w-6!" />
            <span>Profile 😊</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
