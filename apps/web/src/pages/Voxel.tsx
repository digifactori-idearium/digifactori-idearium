import { OrbitControls } from '@react-three/drei';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

interface VoxelPainterProps {
  mode: 'add' | 'remove';
}

function VoxelPainter({ mode }: VoxelPainterProps) {
  const planeRef = useRef<THREE.Mesh>(null!);
  const rollOverRef = useRef<THREE.Mesh>(null!);

  const clickStartTime = useRef(0);
  const [voxels, setVoxels] = useState<THREE.Vector3[]>([]);

  const cubeGeo = useMemo(() => new THREE.BoxGeometry(50, 50, 50), []);
  const cubeMaterial = useMemo(
    () => new THREE.MeshLambertMaterial({ color: 0xfeb74c }),
    []
  );

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

    if (mode == 'remove' && event.object !== planeRef.current) {
      pos.copy(event.object.position);
      return;
    }

    snapPosition(pos);
  };

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clickStartTime.current = performance.now();
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    const clickDuration = performance.now() - clickStartTime.current;
    if (clickDuration > 400) return;

    const position = new THREE.Vector3();

    if (event.face) {
      position.copy(event.point).add(event.face.normal);
    } else {
      position.copy(rollOverRef.current.position);
    }

    snapPosition(position);

    if (mode === 'remove') {
      setVoxels(prev =>
        prev.filter(v => !v.equals(event.object?.position || position))
      );
    } else {
      setVoxels(prev => [...prev, position]);
    }
  };

  return (
    <>
      <color attach="background" args={[0xf0f0f0]} />
      <ambientLight intensity={3} color={0x606060} />
      <directionalLight position={[1, 0.75, 0.5]} intensity={3} />

      {/* RollOver cube */}
      <mesh ref={rollOverRef}>
        <boxGeometry args={[50, 50, 50]} />
        <meshBasicMaterial color={0xff0000} transparent opacity={0.5} />
      </mesh>

      <gridHelper args={[1000, 20]} />

      {/* Plane */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Voxels */}
      {voxels.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          geometry={cubeGeo}
          material={cubeMaterial}
        />
      ))}
    </>
  );
}

export default function Voxel() {
  const isDragging = useRef(false);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 90, // distance depuis le haut de la zone
          left: '50%', // centre horizontal
          transform: 'translateX(-50%)',
          zIndex: 1,
          display: 'flex',
          gap: '10px', // espace entre les boutons
        }}
      >
        <button
          onClick={() => setMode('add')}
          style={{ background: mode === 'add' ? 'lightgreen' : 'grey' }}
        >
          Ajouter
        </button>
        <button
          onClick={() => setMode('remove')}
          style={{
            background: mode === 'remove' ? 'lightcoral' : 'grey',
            marginLeft: 5,
          }}
        >
          Supprimer
        </button>
      </div>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [500, 800, 1300], fov: 45, near: 1, far: 10000 }}
      >
        <VoxelPainter mode={mode} />
        <OrbitControls
          target={[0, 25, 0]}
          onStart={() => {
            isDragging.current = true;
          }}
          onEnd={() => {
            isDragging.current = false;
          }}
        />
      </Canvas>
    </>
  );
}
