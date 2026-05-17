import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';

import { SceneAudio } from './SceneAudio';
import { SceneGradient } from './SceneGradient';

import { sceneState } from '@/stores';

export function SceneEnvironment() {
  const background = useSnapshot(sceneState.background);
  const global = useSnapshot(sceneState.global);
  const mode: IdeoramaMode = useSnapshot(sceneState).mode;
  const { scene } = useThree();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    scene.background = new THREE.Color(background.color);
  }, [background.color, scene]);

  return (
    <>
      <SceneGradient
        baseColor={background.color}
        accentColor={background.accent}
      />
      {global.music.currentTrack && mode === 'play' && (
        <SceneAudio soundTrack={global.music.currentTrack} />
      )}
    </>
  );
}
