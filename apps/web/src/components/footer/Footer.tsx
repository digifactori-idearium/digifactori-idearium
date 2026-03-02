import { Facebook } from 'lucide-react';
import { Twitter } from 'lucide-react';
import { Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Separator } from '@/components/ui/separator';

export function SeparatorVertical() {
  return (
    <div className="flex h-8 items-center gap-20 text-xl font-semibold">
      <Link
        to="https://www.d1g1factory.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground! hover:text-foreground/50! transition-colors no-underline"
      >
        digiFactory
      </Link>
      <Separator orientation="vertical" />
      <Link
        to="https://unamur.be/fr"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground! hover:text-foreground/50! transition-colors no-underline"
      >
        UNamur
      </Link>
      <Separator orientation="vertical" />
      <Link
        to="https://www.facebook.com/d1g1factory?modal=admin_todo_tour"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground! hover:text-foreground/50! transition-colors no-underline"
      >
        <Facebook />
      </Link>
      <Separator orientation="vertical" />
      <Link
        to="https://x.com/HenryJulie"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground! hover:text-foreground/50! transition-colors no-underline"
      >
        <Twitter />
      </Link>
      <Separator orientation="vertical" />
      <Link
        to="https://www.youtube.com/channel/UCPAbqRaHkOZ0sKH_fusA9ng?view_as=subscriber"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground! hover:text-foreground/50! transition-colors no-underline"
      >
        <Youtube />
      </Link>
    </div>
  );
}

export const Footer = () => {
  return (
    <footer
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          transform: 'scaleY(-1)',
          pointerEvents: 'none',
        }}
      ></div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: '12rem',
          paddingBottom: '2rem',
        }}
      >
        <SeparatorVertical />
      </div>
    </footer>
  );
};
