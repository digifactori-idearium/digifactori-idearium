import { House, Moon, Sun } from 'lucide-react';

import { Button } from '../ui/button';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/providers/theme-provider';

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const handleTheme = () => {
    if (theme == 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };
  return (
    <div className="sticky top-0 z-50 bg-sidebar">
      <header className="bg-background md:mt-4 md:rounded-tl-2xl flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
          <div className="flex w-full items-center gap-1">
            <SidebarTrigger className="-ml-1 side-btn text-foreground!" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium flex items-center gap-1.5">
              <House className="h-5" /> <span className="text-base">Home</span>
            </h1>
          </div>
          <div>
            <Button onClick={handleTheme} className="side-btn">
              {theme == 'dark' ? (
                <Sun className=" text-foreground! w-5! h-5!" />
              ) : (
                <Moon className=" text-foreground! w-5! h-5!" />
              )}
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
