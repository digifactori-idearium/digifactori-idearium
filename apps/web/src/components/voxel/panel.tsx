import { useState } from 'react';

interface EditPanelProps {
  modelName?: string;
  mode: 'add' | 'remove' | 'paint';
  setMode: (m: 'add' | 'remove' | 'paint') => void;
  shape:
    | 'cube'
    | 'mur'
    | 'plateforme'
    | 'escalier'
    | 'cadre'
    | 'anneau'
    | 'cercle'
    | 'sphere';
  setShape: (
    s:
      | 'cube'
      | 'mur'
      | 'plateforme'
      | 'escalier'
      | 'cadre'
      | 'anneau'
      | 'cercle'
      | 'sphere'
  ) => void;
  rotationH: number;
  setRotationH: React.Dispatch<React.SetStateAction<number>>;
  rotationV: number;
  setRotationV: React.Dispatch<React.SetStateAction<number>>;
  longueur: number;
  setLongueur: (n: number) => void;
  largeur: number;
  setLargeur: (n: number) => void;
  hauteur: number;
  setHauteur: (n: number) => void;
}

// ─── Shape config ─────────────────────────────────────────────────────────────

const SHAPES = [
  { id: 'cube', emoji: '🧱', label: 'Cube' },
  { id: 'mur', emoji: '🏛️', label: 'Mur' },
  { id: 'plateforme', emoji: '🟫', label: 'Plateau' },
  { id: 'escalier', emoji: '🪜', label: 'Escalier' },
  { id: 'cadre', emoji: '🖼️', label: 'Cadre' },
  { id: 'anneau', emoji: '⭕', label: 'Anneau' },
  { id: 'cercle', emoji: '🔵', label: 'Cercle' },
  { id: 'sphere', emoji: '🔮', label: 'Sphère' },
] as const;

const FORME_DIMS: Record<
  string,
  { longueur: boolean; largeur: boolean; hauteur: boolean }
> = {
  cube: { longueur: false, largeur: false, hauteur: false },
  mur: { longueur: true, largeur: false, hauteur: true },
  plateforme: { longueur: true, largeur: true, hauteur: false },
  escalier: { longueur: false, largeur: true, hauteur: true },
  cadre: { longueur: true, largeur: true, hauteur: false },
  anneau: { longueur: false, largeur: true, hauteur: false },
  cercle: { longueur: false, largeur: true, hauteur: false },
  sphere: { longueur: false, largeur: true, hauteur: false },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">
      {children}
    </p>
  );
}

function DimStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-lg flex items-center justify-center transition-all active:scale-90"
        >
          −
        </button>
        <span className="flex-1 text-center text-white font-black text-lg tabular-nums">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-lg flex items-center justify-center transition-all active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}

function RotationControl({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
}) {
  const deg = (((value % 4) + 4) % 4) * 90;
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-bold text-white/60 w-20 shrink-0">
        {label}
      </span>
      <button
        onClick={onDec}
        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white text-base flex items-center justify-center transition-all active:scale-90"
      >
        ↺
      </button>
      <span className="text-white font-black text-sm w-10 text-center tabular-nums">
        {deg}°
      </span>
      <button
        onClick={onInc}
        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white text-base flex items-center justify-center transition-all active:scale-90"
      >
        ↻
      </button>
    </div>
  );
}

export default function EditPanel({
  modelName,
  mode,
  setMode,
  shape,
  setShape,
  rotationH,
  setRotationH,
  rotationV,
  setRotationV,
  longueur,
  setLongueur,
  largeur,
  setLargeur,
  hauteur,
  setHauteur,
}: EditPanelProps) {
  const [shapesOpen, setShapesOpen] = useState(false);
  const dims = FORME_DIMS[shape];
  const current = SHAPES.find(s => s.id === shape)!;

  return (
    <div
      className="w-full rounded-3xl overflow-hidden"
      style={{
        background:
          'linear-gradient(160deg, rgba(30,20,50,0.97) 0%, rgba(20,15,40,0.97) 100%)',
        boxShadow:
          '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-2 flex items-center gap-3"
        style={{
          background:
            'linear-gradient(90deg, rgba(124,58,237,0.4), rgba(139,92,246,0.15))',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span className="text-2xl">🧱</span>
        <div>
          <p className="text-white font-black text-base leading-none truncate">
            {modelName || 'Modele'}
          </p>
          <p className="text-purple-300 text-xs/snug font-semibold mt-0.5">
            Construction
          </p>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-5 overflow-y-auto scrollbar-hide max-h-[calc(100vh-12rem)]">
        {/* Mode buttons */}
        <div>
          <SectionTitle>Que veux-tu faire ?</SectionTitle>
          <div className="flex flex-col gap-2">
            {/* ADD */}
            <button
              onClick={() => setMode('add')}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl font-black text-sm transition-all active:scale-95"
              style={{
                background:
                  mode === 'add'
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'rgba(255,255,255,0.06)',
                color: 'white',
                boxShadow:
                  mode === 'add' ? '0 4px 20px rgba(34,197,94,0.4)' : 'none',
                border:
                  mode === 'add' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-xl">➕</span>
              <span>Ajouter un bloc</span>
            </button>

            {/* REMOVE */}
            <button
              onClick={() => setMode('remove')}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl font-black text-sm transition-all active:scale-95"
              style={{
                background:
                  mode === 'remove'
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                    : 'rgba(255,255,255,0.06)',
                color: 'white',
                boxShadow:
                  mode === 'remove' ? '0 4px 20px rgba(239,68,68,0.4)' : 'none',
                border:
                  mode === 'remove'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-xl">🗑️</span>
              <span>Effacer un bloc</span>
            </button>

            {/* PAINT */}
            <button
              onClick={() => setMode('paint')}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl font-black text-sm transition-all active:scale-95"
              style={{
                background:
                  mode === 'paint'
                    ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                    : 'rgba(255,255,255,0.06)',
                color: 'white',
                boxShadow:
                  mode === 'paint' ? '0 4px 20px rgba(59,130,246,0.4)' : 'none',
                border:
                  mode === 'paint'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-xl">🎨</span>
              <span>Peindre</span>
            </button>
          </div>
        </div>

        {/*  Shape picker */}
        <div>
          <SectionTitle>Forme</SectionTitle>

          {/* shape pill + toggle */}
          <button
            onClick={() => setShapesOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-2xl transition-all active:scale-95"
            style={{
              background: 'rgba(124,58,237,0.25)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <span className="flex items-center gap-2 font-black text-white text-sm">
              <span className="text-xl">{current.emoji}</span>
              {current.label}
            </span>
            <span className="text-white/40 text-xs">
              {shapesOpen ? '▲' : '▼'}
            </span>
          </button>

          {/* Grid of shapes */}
          {shapesOpen && (
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {SHAPES.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setShape(s.id as any);
                    setShapesOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all active:scale-90"
                  style={{
                    background:
                      shape === s.id
                        ? 'rgba(139,92,246,0.4)'
                        : 'rgba(255,255,255,0.06)',
                    border:
                      shape === s.id
                        ? '1px solid rgba(139,92,246,0.6)'
                        : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="text-xl leading-none">{s.emoji}</span>
                  <span className="text-white/70 font-semibold text-[9px] leading-none text-center">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/*  Dimensions */}
        {(dims.longueur || dims.largeur || dims.hauteur) && (
          <div>
            <SectionTitle>Taille</SectionTitle>
            <div className="flex flex-col gap-3">
              {dims.longueur && (
                <DimStepper
                  label="Longueur"
                  value={longueur}
                  onChange={setLongueur}
                />
              )}
              {dims.largeur && (
                <DimStepper
                  label="Largeur"
                  value={largeur}
                  onChange={setLargeur}
                />
              )}
              {dims.hauteur && (
                <DimStepper
                  label="Hauteur"
                  value={hauteur}
                  onChange={setHauteur}
                />
              )}
            </div>
          </div>
        )}

        {/* Rotation */}
        <div>
          <SectionTitle>Rotation</SectionTitle>
          <div className="flex flex-col gap-2">
            <RotationControl
              label="↔ Côté"
              value={rotationH}
              onDec={() => setRotationH(r => r - 1)}
              onInc={() => setRotationH(r => r + 1)}
            />
            <RotationControl
              label="↕ Haut"
              value={rotationV}
              onDec={() => setRotationV(r => r - 1)}
              onInc={() => setRotationV(r => r + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
