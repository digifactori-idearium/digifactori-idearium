/* eslint-disable react-hooks/immutability */
import { useGLTF, useCursor } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
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

import { Controls } from './Gismo';
import { SpeechBubble } from './SpeechBubble';

import { useTrigger } from '@/hooks/useTrigger';
import { cleanObject } from '@/lib/actions/runtime';
import { sceneState, actions } from '@/stores';

// Scratch objects
const _initPos = new THREE.Vector3();
const _initQuat = new THREE.Quaternion();
const _initScale = new THREE.Vector3();
const _initEuler = new THREE.Euler();
const _box3 = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

// Types
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

// Helpers
function collectMeshes(obj: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  obj.traverse(child => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });
  return meshes;
}

// Model Component
export const Model = memo(function Model({
  id,
  name,
  file,
  ...props
}: ModelProps) {
  // Store
  const snap = useSnapshot(sceneState, { sync: false });
  const isSelected = snap.selectedObjectId === id && snap.mode == 'edit';
  const objectState = snap.objects[id];

  // GLTF
  const { scene: gltfScene } = useGLTF(file) as unknown as GLTFResult;

  const scene = useMemo(() => {
    const clone = SkeletonUtils.clone(gltfScene);
    clone.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(m => m.clone())
          : mesh.material.clone();
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [gltfScene]);

  // Refs
  const modelRef = useRef<THREE.Object3D>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const boxRef = useRef<THREE.LineSegments | null>(null);

  const isDragging = useRef(false);

  // model transform
  const transform = useMemo(
    () => ({
      position: {
        ...(objectState?.transform?.position ?? { x: 0, y: 0, z: 0 }),
      },
      rotation: {
        ...(objectState?.transform?.rotation ?? { x: 0, y: 0, z: 0 }),
      },
      scale: objectState?.transform?.scale ?? 1,
    }),
    [objectState?.transform]
  );

  const style = objectState?.style ?? {
    tint: '#ffffff',
    opacity: 1,
    glow: 0,
    threshold: 0.5,
  };

  //  Cursor
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  //  Collect meshes
  useEffect(() => {
    meshesRef.current = collectMeshes(scene);
  }, [scene]);

  //  Register / unregister in scene registry
  useLayoutEffect(() => {
    if (!modelRef.current) return;
    actions.registerObject(id, modelRef.current);
    return () => {
      cleanObject(id);
      actions.unregisterObject(id);
    };
  }, [id]);

  // Selection box
  useEffect(() => {
    if (!modelRef.current) return;
    const parent = modelRef.current.parent;
    if (!parent) return;

    if (isSelected) {
      _box3.setFromObject(modelRef.current);
      _box3.getSize(_size);
      _box3.getCenter(_center);

      const boxGeo = new THREE.BoxGeometry(_size.x, _size.y, _size.z);
      const edges = new THREE.EdgesGeometry(boxGeo);
      boxGeo.dispose();

      const mat = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.9,
      });

      const lines = new THREE.LineSegments(edges, mat);
      lines.position.copy(_center);
      parent.add(lines);
      boxRef.current = lines;

      return () => {
        parent.remove(lines);
        edges.dispose();
        mat.dispose();
        boxRef.current = null;
      };
    }
  }, [isSelected]);

  useFrame(() => {
    if (!isSelected || !boxRef.current || !modelRef.current) return;

    _box3.setFromObject(modelRef.current);
    _box3.getSize(_size);
    _box3.getCenter(_center);

    const geo = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(_size.x, _size.y, _size.z)
    );
    boxRef.current.geometry.dispose();
    boxRef.current.geometry = geo;
    boxRef.current.position.copy(_center);
  });

  //  Material style (tint / opacity / glow)
  useEffect(() => {
    const tint = new THREE.Color(style.tint || '#ffffff');
    const alpha = style.opacity ?? 1.0;
    const glow = style.glow ?? 0;
    const glowThreshold = style.threshold ?? 0.5;

    for (const mesh of meshesRef.current) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat) continue;

      if (!mat.userData.originalColor) {
        mat.userData.originalColor = mat.color.clone();
      }
      const originalColor = mat.userData.originalColor as THREE.Color;
      mat.color.copy(originalColor).multiply(tint);

      if (glow > 0) {
        const brightness =
          0.299 * originalColor.r +
          0.587 * originalColor.g +
          0.114 * originalColor.b;
        if (brightness > glowThreshold) {
          const glowFactor = Math.min(
            1,
            (brightness - glowThreshold) / (1 - glowThreshold)
          );
          mat.emissive.copy(tint);
          mat.emissiveIntensity = glow * glowFactor;
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
        }
      } else {
        mat.emissive.set('#000000');
        mat.emissiveIntensity = 0;
      }

      mat.transparent = alpha < 1.0;
      mat.opacity = alpha;
      mat.depthWrite = alpha > 0.85;
      mat.needsUpdate = true;
    }
  }, [style.tint, style.opacity, style.glow, style.threshold]);

  // Action triggers
  useTrigger(id, modelRef, 'onStart');
  const triggerOnTap = useTrigger(id, modelRef, 'onTap');

  // Event handlers
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (snap.mode === 'edit') {
        actions.selectObject(id);
        return;
      }
      triggerOnTap?.();
    },
    [id, snap.mode, triggerOnTap]
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
      if (!isSelected) return;
      matrix.decompose(_initPos, _initQuat, _initScale);
      _initEuler.setFromQuaternion(_initQuat);
      actions.updateSlice(
        'transform',
        {
          position: { x: _initPos.x, y: _initPos.y, z: _initPos.z },
          rotation: { x: _initEuler.x, y: _initEuler.y, z: _initEuler.z },
          scale: _initScale.x,
        },
        id
      );
    },
    [id, isSelected]
  );

  const handleDragEnd = useCallback(() => {
    actions.setIsDragging(false);
    isDragging.current = false;
  }, []);

  if (!objectState) return null;

  return (
    <Controls
      selected={isSelected}
      objectID={id}
      objectRef={modelRef}
      initialTransform={transform}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <group
        ref={modelRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
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
      >
        <primitive
          receiveShadow
          castShadow
          {...props}
          object={scene}
          userData={{ id }}
          name={name}
          dispose={null}
        />
        <SpeechBubble objectRef={modelRef} objectId={id} />
      </group>
    </Controls>
  );
});
