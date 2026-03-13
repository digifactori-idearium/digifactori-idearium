import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { speak } from '@/lib/speak';

interface SuperButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tooltip?: string;
  voiceText?: string;
}

export function SuperButton({
  children,
  tooltip,
  voiceText,
  ...props
}: SuperButtonProps) {
  const button = <Button {...props}>{children}</Button>;

  const buttonWithVoice =
    voiceText && window.speechSynthesis ? (
      <Button onMouseEnter={() => speak(voiceText)} {...props}>
        {children}
      </Button>
    ) : (
      button
    );

  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{buttonWithVoice}</TooltipTrigger>
        <TooltipContent className="z-1000!">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    buttonWithVoice
  );
}
