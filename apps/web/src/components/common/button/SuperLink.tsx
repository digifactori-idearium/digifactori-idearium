import { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { speak } from '@/lib/speak';
import { useUser } from '@/providers/UserProvider';

interface SuperLinkProps extends LinkProps {
  children: ReactNode;
  tooltip?: string;
  voiceText?: string;
}

export function SuperLink({
  children,
  tooltip,
  voiceText,
  ...props
}: SuperLinkProps) {
  const link = <Link {...props}>{children}</Link>;
  const { user } = useUser();

  const linkWithVoice =
    voiceText && window.speechSynthesis ? (
      <Link
        onMouseEnter={() => {
          if (user?.voiceButtons) {
            speak(voiceText);
          }
        }}
        {...props}
      >
        {children}
      </Link>
    ) : (
      link
    );

  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{linkWithVoice}</TooltipTrigger>
        <TooltipContent className="z-1000!">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    linkWithVoice
  );
}
