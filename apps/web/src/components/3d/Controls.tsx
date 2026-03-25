import { PivotControls } from '@react-three/drei';
import { ReactNode } from 'react';
import * as THREE from 'three';

// THIS CONTROL IS KEPT IN CASE
// IT HAD MANY PROBLEM, IT WAS COPYING THE WORLD MATRIX ACCROSS OBJECTS ON THE SCENE
// I BUILD A SCRATCH GISMO TO REPLACE IT
interface Props {
  selected: boolean;
  onDragEnd: () => void;
  onDragStart: () => void;
  onDrag: (matrix: THREE.Matrix4) => void;
  objectRef?: React.RefObject<THREE.Object3D | null>;
  objectID?: string;
  children: ReactNode;
  initialTransform?: Transform;
}

export function Controls({
  selected,
  onDragEnd,
  onDragStart,
  onDrag,
  children,
}: Props) {
  return (
    <PivotControls
      autoTransform={false}
      renderOrder={1}
      disableScaling={true}
      rotation={[0, 0, 0]}
      scale={60}
      lineWidth={4}
      fixed
      depthTest={false}
      anchor={[0, 0, 0]}
      onDragStart={onDragStart}
      onDrag={(_l, _d, worldMatrix, _dw) => {
        onDrag(worldMatrix);
      }}
      onDragEnd={onDragEnd}
      visible={selected}
    >
      {children}
    </PivotControls>
  );
}
