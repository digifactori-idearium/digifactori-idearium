import { OrbitControls } from '@react-three/drei';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import * as THREE from 'three';

export interface VoxelPoint {
  x: number;
  y: number;
  z: number;
  color?: string;
}

interface BaseVoxelProps {
  mode: 'add' | 'remove' | 'paint';
  shape:
    | 'cube'
    | 'mur'
    | 'plateforme'
    | 'escalier'
    | 'cadre'
    | 'anneau'
    | 'cercle'
    | 'sphere';
  rotationH: number;
  rotationV: number;
  longueur: number;
  largeur: number;
  hauteur: number;
  voxels: VoxelPoint[];
  onVoxelsChange: React.Dispatch<React.SetStateAction<VoxelPoint[]>>;
}

interface VoxelProps extends BaseVoxelProps {
  setScene: React.Dispatch<React.SetStateAction<THREE.Scene | null>>;
}

interface VoxelMotorProps extends BaseVoxelProps {
  selectedColor: string;
}

function voxelPointToVector3(voxel: VoxelPoint) {
  return new THREE.Vector3(voxel.x, voxel.y, voxel.z);
}

function vector3ToVoxelPoint(vector: THREE.Vector3): VoxelPoint {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function sameVoxel(a: VoxelPoint, b: VoxelPoint) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function VoxelMotor({
  mode,
  shape,
  rotationH,
  rotationV,
  voxels,
  longueur,
  largeur,
  hauteur,
  selectedColor,
  onVoxelsChange,
}: VoxelMotorProps) {
  const planeRef = useRef<THREE.Mesh>(null!);
  const rollOverRef = useRef<THREE.Group>(null!);
  const clickStartTime = useRef(0);
  const isPainting = useRef(false);
  const cubeGeo = useMemo(() => new THREE.BoxGeometry(50, 50, 50), []);

  const snapPosition = (pos: THREE.Vector3) => {
    pos.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    if (pos.y < 25) pos.y = 25;
    return pos;
  };

  const rotateOffset = (x: number, y: number, z: number) => {
    const rx = ((rotationV % 4) + 4) % 4;
    const ry = ((rotationH % 4) + 4) % 4;
    let px = x,
      py = y,
      pz = z;
    for (let i = 0; i < rx; i++) [py, pz] = [-pz, py];
    for (let i = 0; i < ry; i++) [px, pz] = [pz, -px];
    return [px, py, pz];
  };

  const getShapeOffsets = () => {
    const offsets: number[][] = [];
    if (shape === 'cube') offsets.push([0, 0, 0]);
    if (shape === 'mur')
      for (let i = 0; i < longueur; i++)
        for (let y = 0; y < hauteur; y++) offsets.push([i * 50, y * 50, 0]);
    if (shape === 'plateforme')
      for (let x = 0; x < longueur; x++)
        for (let z = 0; z < largeur; z++) offsets.push([x * 50, 0, z * 50]);
    if (shape === 'escalier')
      for (let i = 0; i < hauteur; i++)
        for (let lar = 0; lar < largeur; lar++)
          offsets.push([i * 50, i * 50, lar * 50]);
    if (shape === 'cadre')
      for (let x = 0; x < longueur; x++)
        for (let z = 0; z < largeur; z++)
          if (x === 0 || x === longueur - 1 || z === 0 || z === largeur - 1)
            offsets.push([x * 50, 0, z * 50]);

    const rayon = largeur / 2;
    const epaisseur = 1;
    const rMin = (rayon - epaisseur) * (rayon - epaisseur);
    const rMax = (rayon + 0.5) * (rayon + 0.5);

    if (shape === 'anneau')
      for (let x = -rayon; x <= rayon; x++)
        for (let z = -rayon; z <= rayon; z++) {
          const d = x * x + z * z;
          if (d >= rMin && d <= rMax)
            offsets.push([x * 50 - rayon * 50, 0, z * 50]);
        }

    if (shape === 'cercle')
      for (let x = -rayon; x <= rayon; x++)
        for (let z = -rayon; z <= rayon; z++)
          if (x * x + z * z <= rMax)
            offsets.push([x * 50, 0, z * 50 - rayon * 50]);

    if (shape === 'sphere')
      for (let x = -rayon; x <= rayon; x++)
        for (let y = -rayon; y <= rayon; y++)
          for (let z = -rayon; z <= rayon; z++)
            if (x * x + y * y + z * z <= rMax)
              offsets.push([
                x * 50,
                y * 50 - rayon * 50 + 2 * rayon * 50,
                z * 50,
              ]);

    return offsets.map(o => rotateOffset(o[0], o[1], o[2]));
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!event.face) return;
    const pos = rollOverRef.current.position;
    pos.copy(event.point).add(event.face.normal);
    if (
      (mode === 'remove' || mode === 'paint') &&
      event.object !== planeRef.current
    ) {
      pos.copy(event.object.position);
      return;
    }
    snapPosition(pos);
    if (
      mode === 'paint' &&
      isPainting.current &&
      event.object !== planeRef.current
    ) {
      const base = event.object.position.clone();
      const toPaint: VoxelPoint[] = getShapeOffsets().map(o => {
        const p = base.clone().add(new THREE.Vector3(o[0], o[1], o[2]));
        return vector3ToVoxelPoint(snapPosition(p));
      });
      onVoxelsChange(prev =>
        prev.map(v =>
          toPaint.some(p => sameVoxel(p, v))
            ? { ...v, color: selectedColor }
            : v
        )
      );
    }
  };

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clickStartTime.current = performance.now();
    if (mode === 'paint') isPainting.current = true;
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    isPainting.current = false;
    if (performance.now() - clickStartTime.current > 200) return;

    const position = new THREE.Vector3();
    if (event.face) {
      if (mode === 'add') position.copy(event.point).add(event.face.normal);
      else position.copy(event.object.position);
    } else {
      position.copy(rollOverRef.current.position);
    }
    snapPosition(position);

    const shapeVoxels: VoxelPoint[] = getShapeOffsets().map(o => {
      const p = position.clone().add(new THREE.Vector3(o[0], o[1], o[2]));
      return vector3ToVoxelPoint(snapPosition(p));
    });

    if (mode === 'remove') {
      onVoxelsChange(prev =>
        prev.filter(v => !shapeVoxels.some(p => sameVoxel(v, p)))
      );
    } else if (mode === 'add') {
      onVoxelsChange(prev => {
        const merged = [...prev];
        shapeVoxels.forEach(nv => {
          if (!merged.some(e => sameVoxel(e, nv)))
            merged.push({ ...nv, color: selectedColor });
        });
        return merged;
      });
    } else if (mode === 'paint') {
      onVoxelsChange(prev =>
        prev.map(v =>
          shapeVoxels.some(p => sameVoxel(p, v))
            ? { ...v, color: selectedColor }
            : v
        )
      );
    }
  };

  return (
    <>
      <color attach="background" args={[0xf0f0f0]} />
      <ambientLight intensity={3} color={0x606060} />
      <directionalLight position={[1, 0.75, 0.5]} intensity={3} />
      <group ref={rollOverRef}>
        {getShapeOffsets().map((o, i) => (
          <mesh key={i} position={o as [number, number, number]}>
            <boxGeometry args={[50, 50, 50]} />
            <meshBasicMaterial
              color={selectedColor}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>
      <gridHelper args={[3000, 60]} />
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[3000, 3000]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      {voxels.map((voxel, i) => (
        <mesh
          name="cubeToSave"
          key={`${voxel.x}-${voxel.y}-${voxel.z}-${i}`}
          position={voxelPointToVector3(voxel)}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          geometry={cubeGeo}
        >
          <meshStandardMaterial color={voxel.color || '#feb74c'} />
        </mesh>
      ))}
    </>
  );
}

function SceneBridge({
  setScene,
}: {
  setScene: React.Dispatch<React.SetStateAction<THREE.Scene | null>>;
}) {
  const { scene } = useThree();
  useEffect(() => {
    setScene(scene);
  }, [scene]);
  return null;
}

//  preset colours
const PRESETS = [
  // Neutrals (Dark to Light)
  { color: '#000000' },
  { color: '#374151' },
  { color: '#9ca3af' },
  { color: '#ffffff' },

  // --- Reds & Rose ---
  { color: '#ef4444' },
  { color: '#f87171' },
  { color: '#fca5a5' },
  { color: '#f43f5e' },

  // --- Oranges ---
  { color: '#f97316' },
  { color: '#fb923c' },
  { color: '#fdba74' },

  // --- Yellows ---
  { color: '#eab308' },
  { color: '#fde047' },
  { color: '#fef08a' },

  // --- Greens & Teal ---
  { color: '#10b981' },
  { color: '#34d399' },
  { color: '#6ee7b7' },
  { color: '#14b8a6' },

  // Blues & Indigo
  { color: '#3b82f6' },
  { color: '#60a5fa' },
  { color: '#93c5fd' },
  { color: '#6366f1' },

  //  Purples
  { color: '#8b5cf6' },
  { color: '#a78bfa' },
  { color: '#c4b5fd' },
];
export default function Voxel({
  setScene,
  mode,
  shape,
  rotationH,
  rotationV,
  longueur,
  largeur,
  hauteur,
  voxels,
  onVoxelsChange,
}: VoxelProps) {
  const [selectedColor, setSelectedColor] = useState('#f97316');

  const showPalette = mode === 'paint' || mode === 'add';

  return (
    <div className="w-full h-full relative">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [500, 800, 1300], fov: 45, near: 1, far: 10000 }}
        resize={{ debounce: 0 }}
      >
        <SceneBridge setScene={setScene} />
        <VoxelMotor
          mode={mode}
          shape={shape}
          rotationH={rotationH}
          rotationV={rotationV}
          longueur={longueur}
          largeur={largeur}
          hauteur={hauteur}
          voxels={voxels}
          onVoxelsChange={onVoxelsChange}
          selectedColor={selectedColor}
        />
        <OrbitControls makeDefault target={[0, 25, 0]} />
      </Canvas>

      {/* COLOUR PICKER — always open when in add/paint mode */}
      {showPalette && (
        <div
          className="absolute top-4 right-4 flex flex-col gap-3 p-4 backdrop-blur-md rounded-2xl shadow-2xl w-49"
          style={{
            background:
              'linear-gradient(160deg, rgba(30,20,50,0.97) 0%, rgba(20,15,40,0.97) 100%)',
            boxShadow:
              '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Label */}
          <p className="text-white text-center font-bold text-sm tracking-wide">
            🎨 Choisis une couleur
          </p>

          {/* HexColorPicker — always visible */}
          <div className="rounded-xl overflow-hidden">
            <HexColorPicker
              color={selectedColor}
              onChange={setSelectedColor}
              style={{ width: '100%', height: '160px' }}
            />
          </div>

          {/* Current colour swatch + hex */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg border-2 border-white/40 shrink-0"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-white font-mono text-xs uppercase tracking-widest">
              {selectedColor}
            </span>
          </div>

          {/* Emoji preset swatches */}
          <div className="grid grid-cols-5 gap-1.5">
            {PRESETS.map(({ color }) => (
              <button
                key={color}
                title={color}
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 ml-o.5 rounded-lg text-base flex items-center justify-center transition-all active:scale-90 ${
                  selectedColor === color
                    ? 'ring-2 ring-white scale-110'
                    : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: color,
                  border: '1px solid rgba(139,92,246,0.3)',
                }}
              ></button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
