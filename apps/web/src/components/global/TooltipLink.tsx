import { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipLinkProps extends LinkProps {
  children: ReactNode;
  tooltip?: string;
}

export function TooltipLink({ children, tooltip, ...props }: TooltipLinkProps) {
  const link = <Link {...props}>{children}</Link>;

  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    link
  );
}
