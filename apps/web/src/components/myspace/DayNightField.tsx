import React, { useEffect, useRef } from 'react';

interface DayNightFieldProps {
  width: number;
  height: number;
  isDark: boolean;
  starCount?: number;
  cloudCount?: number;
}

function makeStars(w: number, h: number, n: number): Star[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.7 + 0.3,
    alpha: Math.random(),
    dAlpha: (Math.random() * 0.005 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
  }));
}

function makeCloud(w: number, h: number, randomX: boolean): Cloud {
  const baseR = Math.random() * 50 + 35;
  const nPuffs = Math.floor(Math.random() * 4) + 5;
  const puffs = Array.from({ length: nPuffs }, (_, i) => ({
    dx: (i / (nPuffs - 1) - 0.5) * baseR * 2.8,
    dy: (Math.random() - 0.5) * baseR * 0.5,
    r: baseR * (0.55 + Math.random() * 0.5),
  }));
  return {
    x: randomX ? Math.random() * (w + 200) - 100 : -(baseR * 3),
    y: Math.random() * h * 0.52 + 40,
    speed: Math.random() * 14 + 6,
    alpha: Math.random() * 0.3 + 0.62,
    puffs,
  };
}

function makeClouds(w: number, h: number, n: number): Cloud[] {
  return Array.from({ length: n }, () => makeCloud(w, h, true));
}

export const DayNightField: React.FC<DayNightFieldProps> = ({
  width,
  height,
  isDark,
  starCount = 200,
  cloudCount = 9,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const rafRef = useRef<number>(0);
  const lastShootRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    starsRef.current = makeStars(width, height, starCount);
    cloudsRef.current = makeClouds(width, height, cloudCount);
    shootingRef.current = [];
  }, [width, height, starCount, cloudCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    canvas.width = width;
    canvas.height = height;

    const spawnShoot = () => {
      const ang = (Math.random() * 35 + 15) * (Math.PI / 180);
      shootingRef.current.push({
        x: Math.random() * width * 0.7,
        y: 0,
        vx: Math.cos(ang) * 6,
        vy: Math.sin(ang) * 6,
        life: 0,
        maxLife: 55,
        active: true,
      });
    };

    const drawMoon = () => {
      const mx = width * 0.82,
        my = height * 0.11,
        mr = 34;
      ctx.beginPath();
      ctx.arc(mx, my, mr + 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,180,255,0.07)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = '#EDE0FF';
      ctx.fill();
      // crescent shadow
      ctx.beginPath();
      ctx.arc(mx + mr * 0.38, my - mr * 0.08, mr * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = '#0d0122';
      ctx.fill();
    };

    const drawSun = () => {
      const sx = width * 0.82,
        sy = height * 0.11,
        sr = 44;
      [
        { r: sr + 38, a: 0.05 },
        { r: sr + 22, a: 0.09 },
        { r: sr + 10, a: 0.17 },
      ].forEach(g => {
        ctx.beginPath();
        ctx.arc(sx, sy, g.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,60,${g.a})`;
        ctx.fill();
      });
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD84D';
      ctx.fill();
      // sun gleam
      ctx.beginPath();
      ctx.arc(sx - 10, sy - 10, sr * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,200,0.28)';
      ctx.fill();
    };

    const drawStars = () => {
      starsRef.current.forEach(s => {
        s.alpha += s.dAlpha;
        if (s.alpha > 1) {
          s.alpha = 1;
          s.dAlpha *= -1;
        }
        if (s.alpha < 0.05) {
          s.alpha = 0.05;
          s.dAlpha *= -1;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha.toFixed(2)})`;
        ctx.fill();
      });
    };

    const drawShooting = (ts: number) => {
      if (ts - lastShootRef.current > 3200 + Math.random() * 2500) {
        spawnShoot();
        lastShootRef.current = ts;
      }
      shootingRef.current = shootingRef.current.filter(s => s.active);
      shootingRef.current.forEach(s => {
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        const p = s.life / s.maxLife;
        const a = p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7;
        const tail = 36;
        const gx0 = s.x - s.vx * (tail / 5),
          gy0 = s.y - s.vy * (tail / 5);
        const g = ctx.createLinearGradient(gx0, gy0, s.x, s.y);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, `rgba(255,255,255,${(a * 0.85).toFixed(2)})`);
        ctx.beginPath();
        ctx.moveTo(gx0, gy0);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (s.life >= s.maxLife) s.active = false;
      });
    };

    const drawClouds = (dt: number) => {
      cloudsRef.current.forEach(c => {
        c.x += (c.speed * dt) / 1000;
        const maxR = Math.max(...c.puffs.map(p => p.r));
        if (c.x - maxR * 2 > width + 60) {
          Object.assign(c, makeCloud(width, height, false));
        }
        ctx.save();
        ctx.globalAlpha = c.alpha;
        c.puffs.forEach(p => {
          ctx.beginPath();
          ctx.arc(c.x + p.dx, c.y + p.dy, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.94)';
          ctx.fill();
        });
        ctx.restore();
      });
    };

    const frame = (ts: number) => {
      const dt = lastTsRef.current ? Math.min(ts - lastTsRef.current, 50) : 16;
      lastTsRef.current = ts;
      ctx.clearRect(0, 0, width, height);

      if (isDarkRef.current) {
        drawMoon();
        drawStars();
        drawShooting(ts);
      } else {
        drawSun();
        drawClouds(dt);
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};
