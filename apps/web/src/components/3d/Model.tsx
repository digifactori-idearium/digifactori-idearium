import { useGLTF, useCursor } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { JSX, useState } from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { useSnapshot } from 'valtio';

import { sceneState, actions } from '@/stores';

interface ModelProps extends Omit<
  JSX.IntrinsicElements['mesh'],
  'name' | 'id'
> {
  id: string;
  name: string;
  file: string;
}

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

export function Model({ id, name, file, ...props }: ModelProps) {
  const snap = useSnapshot(sceneState);
  const data = snap.objects[id];
  const { scene } = useGLTF(file) as unknown as GLTFResult;

  const [hovered, setHovered] = useState(false);
  const isSelected = snap.selectedObjectId === id;

  useCursor(hovered);

  useMemo(() => {
    scene.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as any;
        if (mat) {
          mat.color.set(isSelected ? '#ff6080' : data.style.tint || 'white');
          if (mat.emissive) {
            mat.emissive.set(isSelected ? '#ff6080' : '#000000');
            mat.emissiveIntensity = isSelected ? 0.2 : 0;
          }
        }
      }
    });
  }, [scene, isSelected, data.style.tint]);

  if (!data) return null;

  return (
    <primitive
      {...props}
      object={scene}
      name={name}
      position={[
        data.transform.position.x,
        data.transform.position.y,
        data.transform.position.z,
      ]}
      rotation={[
        data.transform.rotation.x,
        data.transform.rotation.y,
        data.transform.rotation.z,
      ]}
      scale={data.transform.scale}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        actions.selectObject(id);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      dispose={null}
    />
  );
}
// Preload to avoid jitter when adding objects
// useGLTF.preload('/compressed.glb');
