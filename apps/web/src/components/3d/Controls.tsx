import { OrbitControls, TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useSnapshot } from 'valtio';

import { sceneState, actions } from '@/stores';

export function Controls() {
  const snap = useSnapshot(sceneState);
  const scene = useThree(state => state.scene);

  const selected = snap.selectedObjectId && snap.objects[snap.selectedObjectId];

  const object = selected && scene.getObjectByName(selected.info.name);

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
          mode="translate"
          onMouseDown={() => actions.setIsDragging(true)}
          onMouseUp={handleDragEnd}
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
