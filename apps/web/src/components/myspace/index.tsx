import React, { useState, useEffect, useMemo } from 'react';

import { Loading } from '@/components/common';
import { IdeoramaCreator } from '@/components/ideorama/IdeoramaCreator';
import BackgroundPicker from '@/components/myspace/Backgroundpicker';
import { DayNightField } from '@/components/myspace/DayNightField';
import OrbitalCard from '@/components/myspace/Orbitalcard';
import ProfileHub from '@/components/myspace/Profilehub';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProfile } from '@/hooks/useProfile';
import { DARK_THEME, LIGHT_THEME } from '@/lib/constants';
import { useTheme } from '@/providers/theme-provider';

function computeCardPositions(cards: CardDef[], dims: MySpaceSceneDims) {
  const { w, h } = dims;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.35;

  return cards.map((_, i) => {
    const angle = (i / cards.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  });
}

const MySpace: React.FC = () => {
  const { fetchProfile, loading } = useProfile();
  const { theme: siteTheme } = useTheme();
  const isMobile = useIsMobile();
  const { open: isSidebarOpen } = useSidebar();

  const isDark = siteTheme === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  /* account */
  const [acc, setAcc] = useState<{ profile: any; user: any } | null>(null);
  const [createsNew, setCreatesNew] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then(setAcc)
      .catch(() => {});
  }, [fetchProfile]);

  /* background */
  const [bgValue, setBgValue] = useState(theme.defaultBg);
  useEffect(() => {
    setBgValue(theme.defaultBg);
  }, [isDark, theme.defaultBg]);

  /* dimensions */
  const sidebarWidth = !isMobile && isSidebarOpen ? 192 : 0;

  const [sceneDims, setSceneDims] = useState<MySpaceSceneDims>({
    w: window.innerWidth - sidebarWidth,
    h: Math.max(window.innerHeight, 560),
  });

  useEffect(() => {
    const update = () => {
      setSceneDims({
        w: window.innerWidth - sidebarWidth,
        h: Math.max(window.innerHeight, 560),
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [sidebarWidth]);

  /* card definitions */
  const cards: CardDef[] = useMemo(() => {
    if (!acc) return [];
    return [
      {
        id: 'ideoramas',
        title: 'Mes Idéoramas',
        emoji: '🏰',
        link: '/app/my-ideoramas',
        count: 3,
        accentColor: '#a855f7',
        tooltipCreate: 'Créer un idéorama',
        orbit: 1,
        onActionClick: () => setCreatesNew(true),
      },
      {
        id: 'models',
        title: 'Mes Modèles',
        emoji: '🤖',
        link: '/app/my-models',
        count: 7,
        accentColor: '#3b82f6',
        tooltipCreate: 'Créer un modèle',
        orbit: 1,
        onActionClick: () => {},
      },
      {
        id: 'ideas',
        title: 'Mes Idées',
        emoji: '💡',
        link: '/app/my-ideas',
        count: 12,
        accentColor: '#f59e0b',
        tooltipCreate: 'Nouvelle idée',
        orbit: 1,
        onActionClick: () => {},
      },
      {
        id: 'text',
        title: 'Éditeur Texte',
        emoji: '📝',
        link: '/app/text-editor',
        count: 5,
        accentColor: '#10b981',
        tooltipCreate: 'Nouveau texte',
        orbit: 2,
        onActionClick: () => {},
      },
      {
        id: 'audio',
        title: 'Éditeur Audio',
        emoji: '🎵',
        link: '/app/audio-editor',
        count: 2,
        accentColor: '#ec4899',
        tooltipCreate: 'Nouvel audio',
        orbit: 2,
        onActionClick: () => {},
      },
    ];
  }, [acc]);

  /* card positions */
  const cardPositions = useMemo(
    () => computeCardPositions(cards, sceneDims),
    [cards, sceneDims]
  );

  /* loading */
  if (!acc || loading) {
    return <Loading />;
  }

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: bgValue, transition: 'background 0.9s ease' }}
    >
      {/* Background layer */}
      <DayNightField width={sceneDims.w} height={sceneDims.h} isDark={isDark} />

      {/* Greeting badge */}
      <div
        className="absolute top-5 left-5 z-30 px-4 py-2 rounded-full text-sm font-bold"
        style={{
          color: theme.greetingText,
          background: theme.greetingBg,
          border: `1px solid ${theme.greetingBorder}`,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.6s ease',
        }}
      >
        {isDark ? '✨' : '☀️'} Bonjour, {acc.profile.pseudo} !
      </div>

      {/* Stats badges */}
      <div className="absolute top-5 right-5 z-30 flex flex-col gap-2 items-end">
        {['29 créations', '5 espaces actifs'].map(label => (
          <div
            key={label}
            className="px-3 py-1 rounded-full text-[11px] font-bold"
            style={{
              color: theme.statText,
              background: theme.statBg,
              border: `1px solid ${theme.statBorder}`,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.6s ease',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Orbit ring */}
      {(() => {
        const r = Math.min(sceneDims.w, sceneDims.h) * 0.38;
        return (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: r * 2,
              height: r * 2,
              top: sceneDims.h / 2,
              left: sceneDims.w / 2,
              transform: 'translate(-50%, -50%)',
              border: `1px dashed ${theme.orbitRingColor}`,
              transition: 'border-color 0.6s ease',
            }}
          />
        );
      })()}

      {/* Pulse rings */}
      {[0, 1.5].map(delay => (
        <div
          key={delay}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: sceneDims.h / 2,
            left: sceneDims.w / 2,
            transform: 'translate(-50%, -50%)',
            width: 100,
            height: 100,
            border: `1px solid ${theme.pulseRingColor}`,
            animation: `pulseRing 3s ease-out ${delay}s infinite`,
          }}
        />
      ))}

      {/* Profile hub */}
      <div
        className="absolute z-20"
        style={{
          top: sceneDims.h / 2,
          left: sceneDims.w / 2,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <ProfileHub
          pseudo={acc.profile.pseudo}
          avatar={acc.profile.avatar}
          profileLink="/app/profile"
          isDark={isDark}
        />
      </div>

      {/* Orbital cards */}
      {cards.map((card, i) => {
        const pos = cardPositions[i];
        if (!pos) return null;
        return (
          <div
            key={card.id}
            className="absolute z-10"
            style={{
              top: pos.y,
              left: pos.x,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <OrbitalCard card={card} isDark={isDark} />
          </div>
        );
      })}

      {/* Background picker */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <BackgroundPicker
          backgrounds={theme.backgrounds}
          active={bgValue}
          onChange={setBgValue}
          isDark={isDark}
        />
      </div>

      <style>{`
        @keyframes pulseRing {
          0%   { width: 100px; height: 100px; opacity: 0.55; }
          100% { width: ${Math.min(sceneDims.w, sceneDims.h) * 0.76}px; height: ${Math.min(sceneDims.w, sceneDims.h) * 0.76}px; opacity: 0; }
        }
      `}</style>

      {createsNew && (
        <IdeoramaCreator
          isOpen={createsNew}
          setIsOpen={setCreatesNew}
          userId={acc.user?.id}
        />
      )}
    </div>
  );
};

export default MySpace;
