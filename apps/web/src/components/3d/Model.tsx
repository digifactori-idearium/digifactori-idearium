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

import { Controls } from './Controls';

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

function collectMeshes(scene: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  scene.traverse(child => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });
  return meshes;
}

function useIsSelected(id: string) {
  const snap = useSnapshot(sceneState, { sync: false });
  return snap.selectedObjectId === id;
}

export const Model = memo(function Model({
  id,
  name,
  file,
  ...props
}: ModelProps) {
  const isSelected = useIsSelected(id);

  const { scene: gltfScene } = useGLTF(file) as unknown as GLTFResult;

  const modelRef = useRef<THREE.Object3D>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);

  const isDragging = useRef(false);

  const transform = useSnapshot(sceneState.objects[id].transform);
  const style = useSnapshot(sceneState.objects[id].style);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

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

  useEffect(() => {
    meshesRef.current = collectMeshes(scene);
  }, [scene]);

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

  useLayoutEffect(() => {
    if (!modelRef.current) return;
    actions.registerObject(id, modelRef.current);
    return () => {
      actions.unregisterObject(id);
    };
  }, [id]);

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

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    actions.setIsDragging(true);
  }, []);

  const handleDrag = useCallback(
    (matrix: THREE.Matrix4) => {
      if (!modelRef?.current) return;

      const _pos = new THREE.Vector3();
      const _quat = new THREE.Quaternion();
      const _scale = new THREE.Vector3();
      const _euler = new THREE.Euler();

      matrix.decompose(_pos, _quat, _scale);
      _euler.setFromQuaternion(_quat);

      actions.updateSlice(
        'transform',
        {
          position: { x: _pos.x, y: _pos.y, z: _pos.z },
          rotation: { x: _euler.x, y: _euler.y, z: _euler.z },
        },
        id
      );
    },
    [id]
  );

  const handleDragEnd = useCallback(() => {
    actions.setIsDragging(false);
    isDragging.current = false;
  }, []);

  return (
    <Controls
      selected={isSelected}
      initialTransform={transform}
      objectRef={modelRef}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
    >
      <primitive
        receiveShadow
        castShadow
        {...props}
        ref={modelRef}
        object={scene}
        userData={{ id }}
        name={name}
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
        dispose={null}
      />
    </Controls>
  );
});
