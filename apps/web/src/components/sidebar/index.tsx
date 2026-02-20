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
  SidebarHeader,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useUser } from '@/providers/UserProvider';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { getUser } = useUser();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <NavBrand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Links</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <React.Suspense fallback={<NavLinkSkeleton />}>
              <NavLink />
            </React.Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {getUser() && (
        <SidebarFooter>
          <SidebarMenuButton asChild>
            <Link
              to="/app/profile"
              role="button"
              className="flex justify-center items-center py-6 text-xl text-white! bg-[#6F51B0]! hover:bg-[#6F51B0]/80! rounded-4xl!"
            >
              <span>😊 Profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
