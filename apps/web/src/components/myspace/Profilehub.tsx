import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProfileHubProps {
  pseudo: string;
  avatar?: string;
  profileLink: string;
  isDark: boolean;
}

const ProfileHub: React.FC<ProfileHubProps> = ({
  pseudo,
  avatar,
  profileLink,
  isDark,
}) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 380);
  };

  const ringGradient = isDark
    ? 'conic-gradient(from 0deg, #a855f7, #ec4899, #f59e0b, #10b981, #3b82f6, #a855f7)'
    : 'conic-gradient(from 0deg, #60a5fa, #34d399, #fbbf24, #f87171, #a78bfa, #60a5fa)';

  const innerBg = isDark
    ? 'radial-gradient(circle at 40% 35%, #2d0660, #120028)'
    : 'radial-gradient(circle at 40% 35%, #ffffff, #e8f5ff)';

  const namColor = isDark ? '#e9d5ff' : '#1e3a5f';

  const glow = isDark
    ? hovered
      ? '0 0 52px rgba(168,85,247,0.85), 0 0 96px rgba(168,85,247,0.28)'
      : '0 0 32px rgba(168,85,247,0.55), 0 0 64px rgba(168,85,247,0.18)'
    : hovered
      ? '0 0 40px rgba(56,189,248,0.6), 0 0 80px rgba(56,189,248,0.18)'
      : '0 0 24px rgba(56,189,248,0.35), 0 0 48px rgba(56,189,248,0.12)';

  return (
    <Link
      to={profileLink}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: clicked
            ? 'scale(0.91)'
            : hovered
              ? 'scale(1.08)'
              : 'scale(1)',
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: '50%',
            padding: 3,
            background: ringGradient,
            boxShadow: glow,
            animation: 'hubSpin 9s linear infinite',
            transition: 'box-shadow 0.4s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: innerBg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              transition: 'background 0.6s ease',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: avatar
                  ? 'transparent'
                  : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                boxShadow: '0 0 16px rgba(245,158,11,0.45)',
                flexShrink: 0,
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={pseudo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                '🧒'
              )}
            </div>

            <span
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 13,
                fontWeight: 800,
                color: namColor,
                letterSpacing: '0.4px',
                lineHeight: 1,
                transition: 'color 0.4s ease',
              }}
            >
              {pseudo}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=swap');
        @keyframes hubSpin {
          from { filter: hue-rotate(0deg); }
          to   { filter: hue-rotate(360deg); }
        }
      `}</style>
    </Link>
  );
};

export default ProfileHub;
