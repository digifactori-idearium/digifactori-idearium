import { OrbitControls, TransformControls } from '@react-three/drei';
import { useSnapshot } from 'valtio';

import { sceneState, actions } from '@/stores';
import { sceneRegistry } from '@/stores';

export function Controls() {
  const snap = useSnapshot(sceneState);
  // const scene = useThree(state => state.scene);

  // const selected = snap.selectedObjectId && snap.objects[snap.selectedObjectId];

  const object = snap.selectedObjectId
    ? sceneRegistry.get(snap.selectedObjectId)
    : null;

  const handleDragEnd = () => {
    if (!object || !snap.selectedObjectId) return;

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
      snap.selectedObjectId
    );

    actions.setIsDragging(false);
  };

  return (
    <>
      {object && (
        <TransformControls
          object={object}
          mode={actions.getTransformMode()}
          onMouseDown={() => actions.setIsDragging(true)}
          onMouseUp={handleDragEnd}
          onChange={() => {
            if (object && snap.transformMode === 2) {
              let s = object.scale.x;
              s = Math.max(1, Math.min(s, 8));
              object.scale.set(s, s, s);
            }
          }}
        />
      )}

      <OrbitControls
        makeDefault
        enabled={!snap.isDragging}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.75}
      />
    </>
  );
}
