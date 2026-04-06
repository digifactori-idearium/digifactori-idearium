import { Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { ArrowDown } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';

import { round } from '@/lib/utils';
import { actions } from '@/stores';

// ─── Types
type DragAxis = 'translateX' | 'translateY' | 'translateZ' | 'rotateY' | null;

interface ArrowHandleProps {
  axis: Exclude<DragAxis, 'rotateY' | null>;
  direction: THREE.Vector3;
  origin: THREE.Vector3;
  isActive: boolean;
  onPointerDown: (e: any, axis: DragAxis) => void;
}

interface TransformSettings {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
}

export interface ControlsProps {
  selected: boolean;
  objectID: string;
  objectRef: React.RefObject<THREE.Object3D | null>;
  initialTransform: TransformSettings;
  children: React.ReactNode;
  onDragStart?: () => void;
  onDrag?: (matrix: THREE.Matrix4) => void;
  onDragEnd?: () => void;
}

// Design tokens
const OFFSET_GAP = 0.2;
const PILL_GAP = 0.15;

const LABEL_EXTRA = 0.1;

const Y_OFFSET_ABOVE_BBOX = 0.5;
const XZ_OFFSET_FROM_BBOX = 0.15;

// Pills label color for control
const COLORS = {
  translateY: { base: '#7CFF7C', active: '#00FF00' },
  rotateY: { base: '#FFE066', active: '#FFB800' },
  translateX: { base: '#FF8A8A', active: '#FF3D3D' },
  translateZ: { base: '#8AD4FF', active: '#00A3FF' },
} as const;

// Scratch objects
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _worldPos = new THREE.Vector3();
const _mat = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scaleVec = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();

// Pill label
function Pill({
  children,
  color,
  lit,
  onPointerDown,
}: {
  children: React.ReactNode;
  color: string;
  lit: boolean;
  onPointerDown: (e: any) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onPointerDown={onPointerDown}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        background: lit || hovered ? `${color}ee` : `${color}33`,
        border: `2px solid ${color}`,
        outline: '1px solid rgba(255,255,255,0.3)',
        color: lit || hovered ? '#000' : '#fff',
        borderRadius: 24,
        padding: '3px 12px',
        fontSize: 12,
        fontWeight: 900,
        fontFamily: 'monospace',
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',
        whiteSpace: 'nowrap',

        transform: hovered
          ? 'scale(1.15) translateY(-2px)'
          : lit
            ? 'scale(1.08)'
            : 'scale(1)',

        boxShadow:
          lit || hovered
            ? `0 0 14px ${color}, 0 0 2px rgba(0,0,0,0.8)`
            : `0 0 4px rgba(0,0,0,0.5)`,

        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </span>
  );
}

// Handle Components

// To change the arrow direction based on the camera
const _originWorld = new THREE.Vector3();
const _tipWorld = new THREE.Vector3();

// X, Y, Z arrow handle
function ArrowHandle({
  axis,
  direction,
  origin,
  isActive,
  onPointerDown,
}: ArrowHandleProps) {
  const { camera, size } = useThree();
  const [hovered, _setHovered] = useState(false);
  const [angleDeg, setAngleDeg] = useState(0);
  const lit = isActive || hovered;
  const color = lit ? COLORS[axis].active : COLORS[axis].base;

  const dir = direction.clone().normalize();
  const pillPos = origin.clone().addScaledVector(dir, LABEL_EXTRA);

  // Change arrow direction according to camera by setting the degree
  useFrame(() => {
    _originWorld.copy(origin).project(camera);
    _tipWorld.copy(origin).addScaledVector(dir, 1).project(camera);

    const dx = (_tipWorld.x - _originWorld.x) * size.width;
    const dy = -(_tipWorld.y - _originWorld.y) * size.height;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    setAngleDeg(angle);
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onPointerDown(e, axis);
  };

  return (
    <group>
      <Html
        position={pillPos.toArray() as [number, number, number]}
        center
        style={{ pointerEvents: 'auto' }}
        zIndexRange={[50, 0]}
      >
        <Pill color={color} lit={lit} onPointerDown={handlePointerDown}>
          <ArrowDown
            size={11}
            strokeWidth={3}
            style={{ display: 'block', transform: `rotate(${angleDeg}deg)` }}
          />
        </Pill>
      </Html>
    </group>
  );
}

function RotateHandle({ radius, isActive, onPointerDown }: any) {
  const [hovered, _setHovered] = useState(false);
  const lit = isActive || hovered;
  const color = lit ? COLORS.rotateY.active : COLORS.rotateY.base;

  // Construct a ring/circle
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }

  const ringGeo = new THREE.BufferGeometry().setFromPoints(pts);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onPointerDown(e, 'rotateY');
  };

  return (
    <group>
      <line>
        <bufferGeometry attach="geometry" {...ringGeo} />
        <lineBasicMaterial attach="material" color={color} />
      </line>

      <Html
        position={[0, 0, -radius + 0.2]}
        center
        style={{ pointerEvents: 'auto' }}
        zIndexRange={[50, 0]}
      >
        <Pill color={color} lit={lit} onPointerDown={handlePointerDown}>
          ↺
        </Pill>
      </Html>
    </group>
  );
}

// Main Controls Component
export function Controls({
  selected,
  objectID,
  objectRef,
  initialTransform,
  children,
  onDragStart,
  onDrag,
  onDragEnd,
}: ControlsProps) {
  const { camera, gl } = useThree();
  const gizmoRef = useRef<THREE.Group>(null);
  const scaleRef = useRef<THREE.Group>(null);
  const activeAxisRef = useRef<DragAxis>(null);
  const [activeDragAxis, setActiveDragAxis] = useState<DragAxis>(null);
  const [bbox, setBbox] = useState({ hw: 0.5, hh: 0.5 });

  // live position and rotation of the model
  const livePos = useRef(
    new THREE.Vector3().set(
      initialTransform.position.x,
      initialTransform.position.y,
      initialTransform.position.z
    )
  );
  const liveRotY = useRef(initialTransform.rotation.y);

  const dragPlane = useRef(new THREE.Plane());
  const dragStart = useRef(new THREE.Vector3());
  const posAtStart = useRef(new THREE.Vector3());
  const rotAtStart = useRef(0);

  useEffect(() => {
    if (activeAxisRef.current) return;
    livePos.current.set(
      initialTransform.position.x,
      initialTransform.position.y,
      initialTransform.position.z
    );
    liveRotY.current = initialTransform.rotation.y;
  }, [initialTransform]);

  useFrame(() => {
    const obj = objectRef.current;
    if (!obj || !gizmoRef.current || !scaleRef.current || !selected) return;

    obj.getWorldPosition(_worldPos);
    gizmoRef.current.position.copy(_worldPos);

    // object size
    _box.setFromObject(obj);
    _box.getSize(_size);

    const maxDim = Math.max(_size.x, _size.y, _size.z);

    // gizmo based on object size ONLY
    const scaleFactor = Math.max(maxDim * 0.5, 0.3);

    scaleRef.current.scale.setScalar(scaleFactor);

    // Normalize bbox for internal layout
    const hw = (_size.x * 0.5) / scaleFactor;
    const hh = (_size.y * 0.5) / scaleFactor;

    if (Math.abs(hw - bbox.hw) > 0.01 || Math.abs(hh - bbox.hh) > 0.01) {
      setBbox({ hw, hh });
    }
  });

  // transform the 2D coordinates into Normalized Device Coordinates (NDC) for 3D using raycaster(laser beam)
  const getHit = useCallback(
    (e: PointerEvent, plane: THREE.Plane) => {
      const rect = gl.domElement.getBoundingClientRect();
      _ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ((e.clientY - rect.top) / rect.height) * -2 + 1
      );
      _raycaster.setFromCamera(_ndc, camera);
      const hit = new THREE.Vector3();
      return _raycaster.ray.intersectPlane(plane, hit) ? hit : null;
    },
    [camera, gl]
  );

  // handle the transformation
  const handlePointerDown = (e: any, axis: DragAxis) => {
    if (e.nativeEvent) e.nativeEvent.preventDefault();
    const obj = objectRef.current;
    if (!axis || !obj) return;

    activeAxisRef.current = axis;
    setActiveDragAxis(axis);
    actions.setIsDragging(true);
    onDragStart?.();

    obj.getWorldPosition(_worldPos);

    // Build Plane
    const normal = new THREE.Vector3(0, 1, 0);
    if (axis === 'translateY') {
      camera.getWorldDirection(normal).setY(0).negate();
    } else if (axis === 'translateX') {
      normal.set(0, 0, 1);
    } else if (axis === 'translateZ') {
      normal.set(1, 0, 0);
    }
    dragPlane.current.setFromNormalAndCoplanarPoint(normal, _worldPos);

    const hit = getHit(e.nativeEvent || e, dragPlane.current);
    if (hit) dragStart.current.copy(hit);
    posAtStart.current.copy(livePos.current);
    rotAtStart.current = liveRotY.current;

    gl.domElement.setPointerCapture(e.pointerId || 0);
  };

  // update live position or rotation while moving the cursor
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const axis = activeAxisRef.current;
      if (!axis || !objectRef.current) return;

      const hit = getHit(e, dragPlane.current);
      if (!hit) return;

      const delta = hit.clone().sub(dragStart.current);

      if (axis === 'rotateY') {
        objectRef.current.getWorldPosition(_worldPos);
        const a0 = Math.atan2(
          dragStart.current.z - _worldPos.z,
          dragStart.current.x - _worldPos.x
        );
        const a1 = Math.atan2(hit.z - _worldPos.z, hit.x - _worldPos.x);
        liveRotY.current = rotAtStart.current + (a1 - a0);
      } else {
        if (axis === 'translateX')
          livePos.current.x = posAtStart.current.x + delta.x;
        if (axis === 'translateY')
          livePos.current.y = posAtStart.current.y + delta.y;
        if (axis === 'translateZ')
          livePos.current.z = posAtStart.current.z + delta.z;
      }

      const obj = objectRef.current;
      obj.position.copy(livePos.current);
      obj.rotation.y = liveRotY.current;

      // keep the initial scale, change through form config
      _scaleVec.setScalar(initialTransform.scale);
      // transform the radiant to rotation degree
      _quat.setFromEuler(
        new THREE.Euler(obj.rotation.x, liveRotY.current, obj.rotation.z)
      );
      // create the object word matrix
      _mat.compose(livePos.current, _quat, _scaleVec);
      // set the object word matrix while dragging
      onDrag?.(_mat);

      //update the store
      actions.updateSlice(
        'transform',
        {
          position: {
            x: round(livePos.current.x),
            y: round(livePos.current.y),
            z: round(livePos.current.z),
          },
          rotation: {
            x: round(obj.rotation.x),
            y: round(liveRotY.current),
            z: round(obj.rotation.z),
          },
          scale: initialTransform.scale,
        },
        objectID
      );
    };

    // stop everyting when releasing the mouse
    const onUp = () => {
      if (!activeAxisRef.current) return;
      activeAxisRef.current = null;
      setActiveDragAxis(null);
      actions.setIsDragging(false);
      onDragEnd?.();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [getHit, objectID, objectRef, initialTransform, onDrag, onDragEnd]);

  // ring of the rotation control
  const ringRadius = (bbox.hw + OFFSET_GAP + PILL_GAP) * 1.1;
  return (
    <>
      {children}
      {selected && (
        <group ref={gizmoRef}>
          <group ref={scaleRef}>
            <ArrowHandle
              axis="translateY"
              direction={new THREE.Vector3(0, 1, 0)}
              origin={new THREE.Vector3(0, bbox.hh + Y_OFFSET_ABOVE_BBOX, 0)}
              isActive={activeDragAxis === 'translateY'}
              onPointerDown={handlePointerDown}
            />
            <ArrowHandle
              axis="translateX"
              direction={new THREE.Vector3(1, 0, 0)}
              origin={new THREE.Vector3(bbox.hw + XZ_OFFSET_FROM_BBOX, 0, 0)}
              isActive={activeDragAxis === 'translateX'}
              onPointerDown={handlePointerDown}
            />
            <ArrowHandle
              axis="translateZ"
              direction={new THREE.Vector3(0, 0, 1)}
              origin={new THREE.Vector3(0, 0, bbox.hw + XZ_OFFSET_FROM_BBOX)}
              isActive={activeDragAxis === 'translateZ'}
              onPointerDown={handlePointerDown}
            />
            <RotateHandle
              radius={ringRadius}
              isActive={activeDragAxis === 'rotateY'}
              onPointerDown={handlePointerDown}
            />
          </group>
        </group>
      )}
    </>
  );
}
