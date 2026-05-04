import { OrbitControls } from '@react-three/drei';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  return {
    x: vector.x,
    y: vector.y,
    z: vector.z,
  };
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
  // const cubeMaterial = useMemo(
  //   () => new THREE.MeshLambertMaterial({ color: 0xfeb74c }),
  //   []
  // );

  const snapPosition = (pos: THREE.Vector3) => {
    pos.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    if (pos.y < 25) pos.y = 25;
    return pos;
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
      const basePosition = event.object.position.clone();
      const positionsToPaint: VoxelPoint[] = [];

      getShapeOffsets().forEach(o => {
        const p = basePosition.clone().add(new THREE.Vector3(o[0], o[1], o[2]));
        snapPosition(p);
        positionsToPaint.push(vector3ToVoxelPoint(p));
      });

      onVoxelsChange(prev =>
        prev.map(v =>
          positionsToPaint.some(p => sameVoxel(p, v))
            ? { ...v, color: selectedColor }
            : v
        )
      );
    }
  };

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clickStartTime.current = performance.now();

    if (mode === 'paint') {
      isPainting.current = true;
    }
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    isPainting.current = false;

    const clickDuration = performance.now() - clickStartTime.current;
    if (clickDuration > 200) return;

    const position = new THREE.Vector3();

    if (event.face) {
      console.log('here');
      if (mode === 'add') {
        position.copy(event.point).add(event.face.normal);
      } else {
        position.copy(event.object.position);
      }
    } else {
      position.copy(rollOverRef.current.position);
    }

    snapPosition(position);

    if (mode === 'remove') {
      const positionsToDelete: VoxelPoint[] = [];

      getShapeOffsets().forEach(o => {
        const p = position.clone().add(new THREE.Vector3(o[0], o[1], o[2]));
        snapPosition(p);
        positionsToDelete.push(vector3ToVoxelPoint(p));
      });

      onVoxelsChange(prev =>
        prev.filter(v => !positionsToDelete.some(p => sameVoxel(v, p)))
      );
    } else if (mode === 'add') {
      const newVoxels: VoxelPoint[] = [];

      getShapeOffsets().forEach(o => {
        const p = position.clone().add(new THREE.Vector3(o[0], o[1], o[2]));
        snapPosition(p);
        newVoxels.push({ ...vector3ToVoxelPoint(p), color: selectedColor });
      });

      onVoxelsChange(prev => {
        const merged = [...prev];

        newVoxels.forEach(newVoxel => {
          const alreadyExists = merged.some(existing =>
            sameVoxel(existing, newVoxel)
          );

          if (!alreadyExists) {
            merged.push(newVoxel);
          }
        });

        return merged;
      });
    } else if (mode === 'paint') {
      const positionsToPaint: VoxelPoint[] = [];

      getShapeOffsets().forEach(o => {
        const p = position.clone().add(new THREE.Vector3(o[0], o[1], o[2]));
        snapPosition(p);
        positionsToPaint.push(vector3ToVoxelPoint(p));
      });

      onVoxelsChange(prev =>
        prev.map(v =>
          positionsToPaint.some(p => sameVoxel(p, v))
            ? { ...v, color: selectedColor }
            : v
        )
      );
    }
  };

  const rotateOffset = (x: number, y: number, z: number) => {
    const rx = ((rotationV % 4) + 4) % 4; // X
    const ry = ((rotationH % 4) + 4) % 4; // Y

    let px = x;
    let py = y;
    let pz = z;

    // 🔵 rotation autour X (vertical)
    for (let i = 0; i < rx; i++) {
      [py, pz] = [-pz, py];
    }

    // 🟢 rotation autour Y (horizontal)
    for (let i = 0; i < ry; i++) {
      [px, pz] = [pz, -px];
    }

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

    if (shape === 'anneau') {
      for (let x = -rayon; x <= rayon; x++) {
        for (let z = -rayon; z <= rayon; z++) {
          const distSq = x * x + z * z;

          if (distSq >= rMin && distSq <= rMax) {
            offsets.push([x * 50 - rayon * 50, 0, z * 50]);
          }
        }
      }
    }

    if (shape === 'cercle') {
      for (let x = -rayon; x <= rayon; x++) {
        for (let z = -rayon; z <= rayon; z++) {
          const distSq = x * x + z * z;

          if (distSq <= rMax) {
            offsets.push([x * 50, 0, z * 50 - rayon * 50]);
          }
        }
      }
    }

    // optionnel (alignement souris comme avant)
    const offsetX = 0;
    const offsetY = rayon * 50;
    const offsetZ = 0;

    if (shape === 'sphere') {
      for (let x = -rayon; x <= rayon; x++) {
        for (let y = -rayon; y <= rayon; y++) {
          for (let z = -rayon; z <= rayon; z++) {
            const distSq = x * x + y * y + z * z;

            if (distSq <= rMax) {
              offsets.push([
                x * 50 - offsetX,
                y * 50 - offsetY + 2 * rayon * 50,
                z * 50 - offsetZ,
              ]);
            }
          }
        }
      }
    }

    return offsets.map(o => rotateOffset(o[0], o[1], o[2]));
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

// SceneRef.displayName = 'SceneRef'

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
  const COLORS = [
    '#f97316',
    '#fb923c',
    '#fdba74',
    '#3b82f6',
    '#60a5fa',
    '#93c5fd',
    '#10b981',
    '#34d399',
    '#6ee7b7',
    '#ef4444',
    '#f87171',
    '#fca5a5',
    '#eab308',
    '#fde047',
    '#fef08a',
    '#8b5cf6',
    '#a78bfa',
    '#c4b5fd',
    '#000000',
    '#374151',
    '#9ca3af',
    '#ffffff',
  ];

  return (
    <div className="w-full h-full relative">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [500, 800, 1300], fov: 45, near: 1, far: 10000 }}
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

      {/* 🎨 PALETTE */}
      {(mode === 'paint' || mode === 'add') && (
        <div className="absolute top-4 right-4 grid grid-cols-4 gap-2 p-4 bg-black/40 backdrop-blur-md rounded-xl shadow-xl">
          {COLORS.map(c => (
            <div
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-8 h-8 rounded-lg cursor-pointer border-2 transition ${
                selectedColor === c
                  ? 'border-white scale-110'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
