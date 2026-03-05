/* eslint-disable react-hooks/immutability */
import { useGLTF, useCursor } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import {
  JSX,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
  memo,
  useMemo,
} from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { SkeletonUtils } from 'three-stdlib';
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

function useObjectTransform(id: string) {
  return useSnapshot(sceneState.objects[id].transform);
}

function useObjectStyle(id: string) {
  return useSnapshot(sceneState.objects[id].style);
}

function useIsSelected(id: string) {
  const snap = useSnapshot(sceneState, { sync: false });
  return snap.selectedObjectId === id;
}

function collectMeshes(scene: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  scene.traverse(child => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });
  return meshes;
}

export const Model = memo(function Model({
  id,
  name,
  file,
  ...props
}: ModelProps) {
  const transform = useObjectTransform(id);
  const style = useObjectStyle(id);
  const isSelected = useIsSelected(id);

  const { scene: gltfScene } = useGLTF(file) as unknown as GLTFResult;

  const scene = useMemo(() => {
    const clone = SkeletonUtils.clone(gltfScene);
    clone.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(m => m.clone())
          : mesh.material.clone();
      }
    });
    return clone;
  }, [gltfScene]);

  const meshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    meshesRef.current = collectMeshes(scene);
  }, [scene]);

  const registeredRef = useRef(false);

  useLayoutEffect(() => {
    if (!registeredRef.current) {
      actions.registerObject(id, scene);
      registeredRef.current = true;
    }
    return () => {
      actions.unregisterObject(id);
      registeredRef.current = false;
    };
  }, [id, scene]);

  useEffect(() => {
    const tint = style.tint || 'white';
    for (const mesh of meshesRef.current) {
      const mat = mesh.material as any;
      if (!mat) continue;
      mat.color.set(isSelected ? '#ff6080' : tint);
      if (mat.emissive) {
        mat.emissive.set(isSelected ? '#ff6080' : '#000000');
        mat.emissiveIntensity = isSelected ? 0.2 : 0;
      }
    }
  }, [isSelected, style.tint]);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      actions.selectObject(id);
    },
    [id]
  );

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => setHovered(false), []);

  const handleContextMenu = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      actions.selectObject(id);
      const nextMode = (sceneState.transformMode + 1) % 3;
      actions.setTransformMode(nextMode);
    },
    [id]
  );

  return (
    <primitive
      {...props}
      object={scene}
      name={name}
      userData={{ id }}
      position={[
        transform.position.x,
        transform.position.y,
        transform.position.z,
      ]}
      rotation={[
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z,
      ]}
      scale={transform.scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onContextMenu={handleContextMenu}
      dispose={null}
    />
  );
});
