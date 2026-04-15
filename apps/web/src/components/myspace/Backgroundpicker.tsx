import React from 'react';

interface BgOption {
  label: string;
  thumb: string;
  value: string;
}

interface BackgroundPickerProps {
  backgrounds: BgOption[];
  active: string;
  onChange: (value: string) => void;
  isDark: boolean;
}

const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
  backgrounds,
  active,
  onChange,
  isDark,
}) => {
  const pillBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.60)';
  const pillBorder = isDark
    ? 'rgba(255,255,255,0.09)'
    : 'rgba(100,160,255,0.25)';
  const labelColor = isDark ? 'rgba(200,180,255,0.55)' : 'rgba(30,80,140,0.55)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 18px',
        borderRadius: 40,
        background: pillBg,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${pillBorder}`,
        transition: 'background 0.5s ease, border-color 0.5s ease',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: labelColor,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          fontFamily: "'Nunito', sans-serif",
          marginRight: 2,
          transition: 'color 0.4s ease',
        }}
      >
        Thème
      </span>

      {backgrounds.map(bg => {
        const isActive = active === bg.value;
        return (
          <button
            key={bg.label}
            title={bg.label}
            onClick={() => onChange(bg.value)}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: bg.thumb,
              border: isActive
                ? `2.5px solid ${isDark ? 'white' : '#1e40af'}`
                : '2.5px solid transparent',
              outline: isActive
                ? `3px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(30,64,175,0.20)'}`
                : 'none',
              cursor: 'pointer',
              transition: 'transform 0.18s ease, outline 0.18s ease',
              transform: isActive ? 'scale(1.18)' : 'scale(1)',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.transform =
                  'scale(1.12)';
            }}
            onMouseLeave={e => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.transform =
                  'scale(1)';
            }}
          />
        );
      })}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap');
      `}</style>
    </div>
  );
};

export default BackgroundPicker;
