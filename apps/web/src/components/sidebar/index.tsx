import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { VoiceLink } from '../global';

import { NavBrand } from './NavBrand';
import { NavLink } from './NavLink';
import { NavLinkSkeleton } from './NavSkeleton';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useProfile } from '@/hooks/useProfile';
import { useUser } from '@/providers/UserProvider';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { fetchProfile, loading } = useProfile();
  const { user } = useUser();

  const [acc, setAcc] = useState<{ profile: any } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setAcc(data);
      } catch {
        /* handled in hook */
      }
    };
    loadProfile();
  }, [fetchProfile]);

  if (!acc || loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" />
        Loading...
      </div>
    );
  }

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
      {user && (
        <SidebarFooter>
          <SidebarMenuButton asChild>
            <VoiceLink
              to="/app/profile"
              voiceText="Voir mon profile"
              role="button"
              className="flex justify-center items-center py-6 text-xl text-white! bg-[#6F51B0]! hover:bg-[#6F51B0]/80! rounded-4xl!"
            >
              <span className="inline-flex items-center gap-2">
                Profil
                <Avatar className="h-[1em] w-[1em] border-2 border-white/20">
                  <AvatarImage
                    src={acc.profile.avatar}
                    alt="Profile Picture"
                    className="object-cover"
                  />
                </Avatar>
              </span>
            </VoiceLink>
          </SidebarMenuButton>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
