import { Canvas, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';

import { Controls } from './Controls';
import { Model } from './Model';
import { SceneAudio } from './SceneAudio';
import { SceneGradient } from './SceneGradient';

import { actions, sceneState } from '@/stores';

const SceneBridge: React.FC<{ sceneRef: any }> = ({ sceneRef }) => {
  const { scene } = useThree();

  useEffect(() => {
    sceneRef.current = scene; // expose la scène à l’extérieur
  }, [scene, sceneRef]);

  return null;
}

const SceneBackground: React.FC<{ color: string }> = ({ color }) => {
  const { scene } = useThree();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    scene.background = new THREE.Color(color);
  }, [color, scene]);

  return null;
};

export const Scene: React.FC<{sceneRef: any}> = ({sceneRef}) => {
  const snap = useSnapshot(sceneState);

  const soundTrack = snap.global.music.currentTrack;
  const objects = snap.objects;

  const intensities = {
    bright: 2,
    dim: 1,
    dark: 0.5,
  };

  return (
    <div id="canvas-container" className="w-full h-full">
      <Canvas
        shadows
        orthographic
        camera={{
          zoom: 3,
          position: [200, 200, 200],
          near: 0.1,
          far: 1000,
        }}
      >
        <SceneBridge sceneRef={sceneRef} />
        {soundTrack && <SceneAudio soundTrack={soundTrack} />}

        <SceneGradient
          baseColor={snap.background.color}
          accentColor={snap.background.accent}
        />

        <SceneBackground color={snap.background.color} />

        <ambientLight intensity={0.5} color="white" />

        <directionalLight
          position={[50, 100, 100]}
          castShadow={true}
          intensity={
            intensities[snap.global.brightness as keyof typeof intensities] ?? 1
          }
          color="white"
          shadow-mapSize={[1024, 1024]}
        />

        <pointLight position={[-10, -10, -10]} intensity={5} color="blue" />

        <Suspense fallback={null}>
          {Object.entries(objects).map(([id, objectData]) => (
            <Model
              key={id}
              id={id}
              //   file={objectData.file || '/Table.gltf'}
              name={objectData.info.name || 'table'}
              file={'/models/Table.gltf'}
              //   name={'table'}
            />
          ))}
        </Suspense>

        {/* Floor */}
        {!snap.floor.hidden && (
          <mesh name="floor" receiveShadow position={[50, -5, 50]}>
            <boxGeometry args={[100, 10, 100]} />
            <meshPhongMaterial color={snap.floor.color} />
          </mesh>
        )}

        {/* RIGHT WALL */}
        {!snap.rightWall.hidden && (
          <mesh
            name="rightWall"
            position={[45, 45, -5]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <boxGeometry args={[110, 10, 110]} />
            <meshPhongMaterial color={snap.rightWall.color} />
          </mesh>
        )}

        {/* LEFT WALL */}
        {!snap.leftWall.hidden && (
          <mesh
            name="leftWall"
            position={[-5, 45, 50]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <boxGeometry args={[110, 10, 100]} />
            <meshPhongMaterial color={snap.leftWall.color} />
          </mesh>
        )}

        {/* Backdrop / Click Surface to Clear Selection */}
        <mesh
          position={[50, 50, -50]}
          rotation={[0, 0, 0]}
          onPointerDown={e => {
            e.stopPropagation();
            // Only clear if we aren't currently moving an object
            if (!snap.isDragging) {
              actions.selectObject(null);
            }
          }}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <Controls />
      </Canvas>
    </div>
  );
};

export default Scene;
