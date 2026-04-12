import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface OrbitalCardProps {
  card: CardDef;
  isDark: boolean;
}

const OrbitalCard: React.FC<OrbitalCardProps> = ({ card, isDark }) => {
  const [hovered, setHovered] = useState(false);
  const [actionPopped, setActionPopped] = useState(false);

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActionPopped(true);
    setTimeout(() => setActionPopped(false), 360);
    card.onActionClick();
  };

  /* Dark: translucent dark card. Light: white frosted card */
  const cardBg = isDark
    ? hovered
      ? `color-mix(in srgb, ${card.accentColor} 22%, #1a0845)`
      : `color-mix(in srgb, ${card.accentColor} 12%, #1a0845)`
    : hovered
      ? 'rgba(255,255,255,0.92)'
      : 'rgba(255,255,255,0.78)';

  const borderColor = isDark
    ? hovered
      ? `${card.accentColor}70`
      : `${card.accentColor}28`
    : hovered
      ? `${card.accentColor}90`
      : `${card.accentColor}45`;

  const titleColor = isDark ? 'white' : '#1e293b';

  const shadow = hovered
    ? isDark
      ? `0 12px 36px rgba(0,0,0,0.55), 0 0 24px ${card.accentColor}44`
      : `0 12px 36px rgba(0,0,0,0.18), 0 0 20px ${card.accentColor}30`
    : isDark
      ? '0 6px 20px rgba(0,0,0,0.40)'
      : '0 4px 16px rgba(0,0,0,0.10)';

  const emojiBg = isDark ? `${card.accentColor}18` : `${card.accentColor}14`;

  const emojiFilter = hovered
    ? `drop-shadow(0 0 10px ${card.accentColor})`
    : `drop-shadow(0 0 4px ${card.accentColor}66)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@700;800&display=swap');
      `}</style>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.18)' : 'scale(1)',
        }}
      >
        <Link
          to={card.link}
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div
            style={{
              width: 118,
              borderRadius: 20,
              overflow: 'hidden',
              background: cardBg,
              border: `2px solid ${borderColor}`,
              boxShadow: shadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.25s ease',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {/* Count badge */}
            <div
              style={{
                position: 'absolute',
                top: 7,
                right: 8,
                background: isDark
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(0,0,0,0.08)',
                backdropFilter: 'blur(4px)',
                color: isDark ? 'white' : '#334155',
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                borderRadius: 10,
                padding: '1px 7px',
                zIndex: 5,
                lineHeight: 1.6,
              }}
            >
              {card.count}
            </div>

            {/* Emoji zone */}
            <div
              style={{
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: emojiBg,
                fontSize: 34,
                filter: emojiFilter,
                transition: 'filter 0.25s ease',
              }}
            >
              {card.emoji}
            </div>

            {/* Label + action */}
            <div
              style={{
                padding: '8px 8px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 12,
                  fontWeight: 700,
                  color: titleColor,
                  textAlign: 'center',
                  lineHeight: 1.25,
                  display: 'block',
                  transition: 'color 0.3s ease',
                }}
              >
                {card.title}
              </span>

              <button
                title={card.tooltipCreate}
                onClick={handleAction}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: 'none',
                  background: card.accentColor,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: `0 2px 8px ${card.accentColor}66`,
                  transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: actionPopped
                    ? 'scale(1.5) rotate(90deg)'
                    : hovered
                      ? 'scale(1.1) rotate(45deg)'
                      : 'scale(1) rotate(0deg)',
                  flexShrink: 0,
                }}
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default OrbitalCard;
