import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { speak } from '@/lib/speak';
import { useUser } from '@/providers/UserProvider';

interface VoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  voiceText?: string;
}
export function VoiceButton({
  children,
  voiceText,
  ...props
}: VoiceButtonProps) {
  const { user } = useUser();

  if (!window.speechSynthesis || !voiceText) {
    return <Button {...props}>{children}</Button>;
  }

  return (
    <Button
      onMouseEnter={() => {
        if (user?.voiceButtons) {
          speak(voiceText);
        }
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
