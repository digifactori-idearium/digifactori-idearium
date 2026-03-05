import { OrbitControls, TransformControls } from '@react-three/drei';
import { useMemo } from 'react';
import { useSnapshot } from 'valtio';

import { sceneState, sceneRegistry, actions } from '@/stores/room.store';

export function Controls() {
  const { selectedObjectId, isDragging, transformMode } =
    useSnapshot(sceneState);

  const object = useMemo(() => {
    return selectedObjectId ? sceneRegistry.get(selectedObjectId) : undefined;
  }, [selectedObjectId]);

  const handleDragEnd = () => {
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
  };

  return (
    <>
      {object && (
        <TransformControls
          key={selectedObjectId ?? 'no-selection'}
          object={object}
          mode={actions.getTransformMode()}
          onMouseDown={() => actions.setIsDragging(true)}
          onMouseUp={handleDragEnd}
          onChange={() => {
            if (object && transformMode === 2) {
              let s = object.scale.x;
              s = Math.max(1, Math.min(s, 8));
              object.scale.set(s, s, s);
            }
          }}
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
