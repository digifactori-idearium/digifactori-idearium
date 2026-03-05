import { OrbitControls, TransformControls } from '@react-three/drei';
import { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';

import { sceneState, sceneRegistry, actions } from '@/stores/room.store';

export function Controls() {
  const { isDragging, selectedObjectId, transformMode } = useSnapshot(
    sceneState,
    { sync: false }
  );

  const [object, setObject] = useState<THREE.Object3D | undefined>(() =>
    selectedObjectId ? sceneRegistry.get(selectedObjectId) : undefined
  );

  useEffect(() => {
    if (!selectedObjectId) {
      setObject(undefined);
      return;
    }

    const existing = sceneRegistry.get(selectedObjectId);
    if (existing) {
      setObject(existing);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    function tryGet() {
      if (cancelled) return;
      const obj = sceneRegistry.get(selectedObjectId!);
      if (obj) {
        setObject(obj);
        return;
      }
      if (++attempts < MAX_ATTEMPTS) requestAnimationFrame(tryGet);
    }

    requestAnimationFrame(tryGet);

    return () => {
      cancelled = true;
    };
  }, [selectedObjectId]);

  const handleDragEnd = useCallback(() => {
    if (!object || !selectedObjectId) return;

    actions.updateSlice(
      'transform',
      {
        position: {
          x: object.position.x,
          y: object.position.y,
          z: object.position.z,
        },
        rotation: {
          x: object.rotation.x,
          y: object.rotation.y,
          z: object.rotation.z,
        },
        scale: object.scale.x,
      },
      selectedObjectId
    );

    actions.setIsDragging(false);
  }, [object, selectedObjectId]);

  const handleChange = useCallback(() => {
    if (object && transformMode === 2) {
      const s = Math.max(1, Math.min(object.scale.x, 8));
      object.scale.set(s, s, s);
    }
  }, [object, transformMode]);

  return (
    <>
      {object && (
        <TransformControls
          key={selectedObjectId ?? 'no-selection'}
          object={object}
          mode={actions.getTransformMode()}
          onMouseDown={() => actions.setIsDragging(true)}
          onMouseUp={handleDragEnd}
          onChange={handleChange}
        />
      )}
      <OrbitControls
        makeDefault
        enabled={!isDragging}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.75}
      />
    </>
  );
}
