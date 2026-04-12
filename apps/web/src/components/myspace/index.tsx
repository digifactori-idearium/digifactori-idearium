import { Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { IdeoramaCreator } from '@/components/ideorama/IdeoramaCreator';
import BackgroundPicker from '@/components/myspace/Backgroundpicker';
import OrbitalCard from '@/components/myspace/Orbitalcard';
import ProfileHub from '@/components/myspace/Profilehub';
import StarField from '@/components/myspace/Starfield';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/providers/theme-provider';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export interface CardDef {
  id: string;
  title: string;
  emoji: string;
  link: string;
  count: number;
  accentColor: string;
  tooltipCreate: string;
  orbit: 1 | 2;
  onActionClick: () => void;
}

/* ─────────────────────────────────────────────
   Theme palettes
───────────────────────────────────────────── */
interface ThemePalette {
  backgrounds: { label: string; thumb: string; value: string }[];
  defaultBg: string;
  orbitRingColor: string;
  pulseRingColor: string;
  greetingText: string;
  greetingBg: string;
  greetingBorder: string;
  statText: string;
  statBg: string;
  statBorder: string;
  loadingBg: string;
  loadingText: string;
  loadingSpinner: string;
}

const DARK_THEME: ThemePalette = {
  backgrounds: [
    {
      label: 'Cosmos',
      thumb: 'radial-gradient(#2a0550,#060010)',
      value:
        'radial-gradient(ellipse at 50% 38%, #1e0440 0%, #0d0122 55%, #060010 100%)',
    },
    {
      label: 'Océan nuit',
      thumb: 'radial-gradient(#001840,#000a18)',
      value:
        'radial-gradient(ellipse at 50% 38%, #001840 0%, #000d22 55%, #000a18 100%)',
    },
    {
      label: 'Forêt nuit',
      thumb: 'radial-gradient(#091a00,#010800)',
      value:
        'radial-gradient(ellipse at 50% 38%, #091a00 0%, #041000 55%, #010800 100%)',
    },
    {
      label: 'Crépuscule',
      thumb: 'radial-gradient(#2e0018,#0d0006)',
      value:
        'radial-gradient(ellipse at 50% 38%, #2e0018 0%, #180010 55%, #0d0006 100%)',
    },
    {
      label: 'Minuit',
      thumb: 'radial-gradient(#0d0d22,#04040e)',
      value:
        'radial-gradient(ellipse at 50% 38%, #0d0d22 0%, #080818 55%, #04040e 100%)',
    },
  ],
  defaultBg:
    'radial-gradient(ellipse at 50% 38%, #1e0440 0%, #0d0122 55%, #060010 100%)',
  orbitRingColor: 'rgba(255,255,255,0.07)',
  pulseRingColor: 'rgba(168,85,247,0.28)',
  greetingText: '#d8b4fe',
  greetingBg: 'rgba(255,255,255,0.06)',
  greetingBorder: 'rgba(255,255,255,0.10)',
  statText: '#c4b5fd',
  statBg: 'rgba(255,255,255,0.07)',
  statBorder: 'rgba(255,255,255,0.10)',
  loadingBg: '#0d0122',
  loadingText: '#a78bfa',
  loadingSpinner: 'text-purple-400',
};

const LIGHT_THEME: ThemePalette = {
  backgrounds: [
    {
      label: 'Ciel bleu',
      thumb: 'linear-gradient(180deg,#a8d8f0,#e8f5ff)',
      value: 'linear-gradient(180deg, #87ceeb 0%, #b8e4f9 40%, #e8f5ff 100%)',
    },
    {
      label: 'Aube',
      thumb: 'linear-gradient(180deg,#ffcba4,#fff5e0)',
      value: 'linear-gradient(180deg, #ffd6a5 0%, #ffe8cc 50%, #fff8f0 100%)',
    },
    {
      label: 'Prairie',
      thumb: 'linear-gradient(180deg,#b5e48c,#f0ffe0)',
      value: 'linear-gradient(180deg, #90e86f 0%, #c5f0a0 45%, #f0ffe0 100%)',
    },
    {
      label: 'Rose pâle',
      thumb: 'linear-gradient(180deg,#ffb3c6,#fff0f5)',
      value: 'linear-gradient(180deg, #ffb3c6 0%, #ffd6e0 45%, #fff0f5 100%)',
    },
    {
      label: 'Lavande',
      thumb: 'linear-gradient(180deg,#c3b1e1,#f3f0ff)',
      value: 'linear-gradient(180deg, #c3b1e1 0%, #ddd5f5 45%, #f3f0ff 100%)',
    },
  ],
  defaultBg: 'linear-gradient(180deg, #87ceeb 0%, #b8e4f9 40%, #e8f5ff 100%)',
  orbitRingColor: 'rgba(0,100,200,0.12)',
  pulseRingColor: 'rgba(56,189,248,0.25)',
  greetingText: '#0c4a6e',
  greetingBg: 'rgba(255,255,255,0.55)',
  greetingBorder: 'rgba(100,180,255,0.30)',
  statText: '#075985',
  statBg: 'rgba(255,255,255,0.55)',
  statBorder: 'rgba(100,180,255,0.25)',
  loadingBg: '#e8f5ff',
  loadingText: '#0369a1',
  loadingSpinner: 'text-sky-500',
};

/* ─────────────────────────────────────────────
   Orbit constants
───────────────────────────────────────────── */
const ORBIT_1_SPEED = 0.00022; // rad/ms clockwise
const ORBIT_2_SPEED = -0.00038; // rad/ms counter-clockwise
const ORBIT_1_RATIO = 0.36; // fraction of min(w,h)
const ORBIT_2_RATIO = 0.2;

/* ─────────────────────────────────────────────
   MySpace
───────────────────────────────────────────── */
const MySpace: React.FC = () => {
  const { fetchProfile, loading } = useProfile();
  const { theme: siteTheme } = useTheme();

  const isDark = siteTheme === 'dark';

  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const [acc, setAcc] = useState<{ profile: any; user: any } | null>(null);
  const [createsNew, setCreatesNew] = useState(false);

  /* bg resets to theme default whenever theme changes */
  const [bgValue, setBgValue] = useState(theme.defaultBg);
  useEffect(() => {
    setBgValue(theme.defaultBg);
  }, [isDark]);

  /* scene dimensions */
  const sceneRef = useRef<HTMLDivElement>(null);
  const [sceneDims, setSceneDims] = useState({ w: 800, h: 640 });

  /* orbital animation */
  const anglesRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number | null>(null);
  const [cardPositions, setCardPositions] = useState<
    { x: number; y: number }[]
  >([]);

  /* load profile */
  useEffect(() => {
    const load = async () => {
      try {
        setAcc(await fetchProfile());
      } catch {
        /* handled in hook */
      }
    };
    load();
  }, [fetchProfile]);

  /* resize observer */
  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSceneDims({ w: width, h: Math.max(height, 560) });
    });
    if (sceneRef.current) obs.observe(sceneRef.current);
    return () => obs.disconnect();
  }, []);

  /* card definitions */
  const cards: CardDef[] = acc
    ? [
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
      ]
    : [];

  /* init angles once */
  useEffect(() => {
    if (!cards.length) return;
    const o1 = cards.filter(c => c.orbit === 1);
    const o2 = cards.filter(c => c.orbit === 2);
    anglesRef.current = cards.map(c => {
      const grp = c.orbit === 1 ? o1 : o2;
      const idx = grp.indexOf(c);
      return (idx / grp.length) * 2 * Math.PI - Math.PI / 2;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  /* animation loop */
  const animate = useCallback(
    (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(ts - lastTsRef.current, 50);
      lastTsRef.current = ts;

      const { w, h } = sceneDims;
      const base = Math.min(w, h);
      const cx = w / 2,
        cy = h / 2;
      const r1 = base * ORBIT_1_RATIO;
      const r2 = base * ORBIT_2_RATIO;

      anglesRef.current = anglesRef.current.map((a, i) => {
        const card = cards[i];
        if (!card) return a;
        return a + (card.orbit === 1 ? ORBIT_1_SPEED : ORBIT_2_SPEED) * dt;
      });

      setCardPositions(
        anglesRef.current.map((a, i) => {
          const card = cards[i];
          if (!card) return { x: cx, y: cy };
          const r = card.orbit === 1 ? r1 : r2;
          return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
        })
      );

      rafRef.current = requestAnimationFrame(animate);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sceneDims, cards.length]
  );

  useEffect(() => {
    if (!cards.length) return;
    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, cards.length]);

  /* derived sizes */
  const base = Math.min(sceneDims.w, sceneDims.h);
  const r1px = base * ORBIT_1_RATIO;
  const r2px = base * ORBIT_2_RATIO;

  /* loading */
  if (!acc || loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: theme.loadingBg }}
      >
        <Loader2 className={`animate-spin mr-2 ${theme.loadingSpinner}`} />
        <span style={{ color: theme.loadingText, fontWeight: 600 }}>
          Chargement…
        </span>
      </div>
    );
  }

  return (
    <div
      ref={sceneRef}
      className="w-full h-full relative overflow-hidden"
      style={{ background: bgValue, transition: 'background 0.9s ease' }}
    >
      {/* ── Animated background layer (stars/clouds) ── */}
      <StarField width={sceneDims.w} height={sceneDims.h} isDark={isDark} />

      {/* ── Greeting ── */}
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

      {/* ── Stats ── */}
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

      {/* ── Orbit rings ── */}
      {[r1px, r2px].map((r, i) => (
        <div
          key={i}
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
      ))}

      {/* ── Pulse rings ── */}
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

      {/* ── Profile hub (centre) ── */}
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

      {/* ── Orbital cards ── */}
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

      {/* ── Background picker ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <BackgroundPicker
          backgrounds={theme.backgrounds}
          active={bgValue}
          onChange={setBgValue}
          isDark={isDark}
        />
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes pulseRing {
          0%   { width: 100px; height: 100px; opacity: 0.55; }
          100% { width: ${r1px * 1.9}px; height: ${r1px * 1.9}px; opacity: 0; }
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
