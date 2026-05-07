import { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';

import { speak } from '@/lib/speak';
import { useUser } from '@/providers/UserProvider';

interface VoiceLinkProps extends LinkProps {
  children: ReactNode;
  voiceText?: string;
}

export function VoiceLink({ children, voiceText, ...props }: VoiceLinkProps) {
  const { user } = useUser();

  if (!window.speechSynthesis || !voiceText) {
    return <Link {...props}>{children}</Link>;
  }

  return (
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
  );
}
