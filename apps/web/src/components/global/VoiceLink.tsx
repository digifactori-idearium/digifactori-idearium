import { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';

import { speak } from '@/lib/speak';

interface VoiceLinkProps extends LinkProps {
  children: ReactNode;
  voiceText?: string;
}

export function VoiceLink({ children, voiceText, ...props }: VoiceLinkProps) {
  if (!window.speechSynthesis || !voiceText) {
    return <Link {...props}>{children}</Link>;
  }

  return (
    <Link onMouseEnter={() => speak(voiceText)} {...props}>
      {children}
    </Link>
  );
}
