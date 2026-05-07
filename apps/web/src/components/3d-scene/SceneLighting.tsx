import { useSnapshot } from 'valtio';

import { sceneState } from '@/stores';

const intensities = { bright: 2, dim: 1, dark: 0.5 };

export function SceneLighting() {
  const global = useSnapshot(sceneState.global);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 100, 50]}
        castShadow
        intensity={
          intensities[global.brightness as keyof typeof intensities] ?? 1
        }
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-100, 100, 100, -100, 0.5, 500]}
        />
      </directionalLight>
    </>
  );
}
