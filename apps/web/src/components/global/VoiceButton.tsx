import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { speak } from '@/lib/speak';

interface VoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  voiceText?: string;
}
export function VoiceButton({
  children,
  voiceText,
  ...props
}: VoiceButtonProps) {
  if (!window.speechSynthesis || !voiceText) {
    return <Button {...props}>{children}</Button>;
  }

  return (
    <Button onMouseEnter={() => speak(voiceText)} {...props}>
      {children}
    </Button>
  );
}
