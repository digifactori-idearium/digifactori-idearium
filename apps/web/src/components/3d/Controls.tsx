import { PivotControls } from '@react-three/drei';
import { ReactNode } from 'react';
import * as THREE from 'three';

interface Props {
  selected: boolean;
  onDragEnd: () => void;
  onDragStart: () => void;
  onDrag: (matrix: THREE.Matrix4) => void;
  objectRef?: React.RefObject<THREE.Object3D | null>;
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
      renderOrder={1}
      disableScaling={true}
      rotation={[0, 0, 0]}
      scale={60}
      lineWidth={4}
      fixed
      depthTest={false}
      anchor={[0, 0, 0]}
      onDragStart={onDragStart}
      onDrag={worldMatrix => {
        onDrag(worldMatrix);
      }}
      onDragEnd={onDragEnd}
      visible={selected}
    >
      {children}
    </PivotControls>
  );
}
