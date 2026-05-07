import { RoundedBox } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useSnapshot } from 'valtio';

import { sceneState } from '@/stores';

export function SceneFloor() {
  const floor = useSnapshot(sceneState.floor);

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <RoundedBox
        name="floor"
        args={[20, 0.3, 20]}
        radius={0.15}
        smoothness={4}
        position={[0, -0.15, 0]}
        receiveShadow
        castShadow
        visible={!floor.hidden}
      >
        <meshStandardMaterial
          color={floor.color}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0}
        />
      </RoundedBox>
    </RigidBody>
  );
}
