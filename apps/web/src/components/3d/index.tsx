import { useDroppable } from '@dnd-kit/core';
import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  RoundedBox,
} from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import React, { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';

import { AssetsDropHandler } from '../assets/AssetsDropHandler';

import { Model } from './Model';
import { SceneAudio } from './SceneAudio';
import { SceneGradient } from './SceneGradient';

import { ActionTicker } from '@/lib/actionRuntime';
import { actions, sceneState } from '@/stores';

const SceneBackground: React.FC<{ color: string }> = ({ color }) => {
  const { scene } = useThree();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    scene.background = new THREE.Color(color);
  }, [color, scene]);

  return null;
};

export const Scene: React.FC = () => {
  const snap = useSnapshot(sceneState);

  const soundTrack = snap.global.music.currentTrack;
  const objects = snap.objects;

  const intensities = {
    bright: 2,
    dim: 1,
    dark: 0.5,
  };

  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });
  return (
    <div
      id="canvas-container"
      ref={setNodeRef}
      className={`w-full h-full ${isOver ? 'droppable active' : 'droppable'}`}
    >
      <Canvas
        shadows
        orthographic
        camera={{
          zoom: 50,
          position: [-50, 30, -50],
          near: 0.1,
          far: 2000,
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => e.preventDefault()}
        onPointerMissed={() => {
          if (!snap.isDragging) {
            actions.selectObject(null);
          }
        }}
      >
        {/* Action Ticker */}
        <ActionTicker />

        {/* Scene Property */}
        <SceneGradient
          baseColor={snap.background.color}
          accentColor={snap.background.accent}
        />
        <SceneBackground color={snap.background.color} />
        {soundTrack && snap.mode == 'play' && (
          <SceneAudio soundTrack={soundTrack} />
        )}
        <AssetsDropHandler />

        {/* Physics to continue after */}
        <Physics gravity={[0, -9.81, 0]}>
          {/* Basic Floor */}
          <RigidBody type="fixed" colliders="cuboid">
            <RoundedBox
              name="floor"
              args={[20, 0.3, 20]}
              radius={0.15}
              smoothness={4}
              position={[0, -0.15, 0]}
              receiveShadow
              castShadow
              visible={!snap.floor.hidden}
            >
              <meshStandardMaterial
                color={snap.floor.color}
                roughness={0.9}
                metalness={0}
                envMapIntensity={0} //kills reflections
              />
            </RoundedBox>
          </RigidBody>

          {/*  Objects/Assets  */}
          <Suspense fallback={null}>
            {Object.entries(objects).map(([id, objectData]) => (
              <Model
                key={id}
                id={id}
                name={objectData.info.name || 'persone'}
                file={objectData.info.file || '/models/person.glb'}
              />
            ))}
          </Suspense>
        </Physics>

        {/*  Lights  */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 100, 50]}
          castShadow
          intensity={
            intensities[snap.global.brightness as keyof typeof intensities] ?? 1
          }
          shadow-mapSize={[2048, 2048]}
        >
          <orthographicCamera
            attach="shadow-camera"
            args={[-100, 100, 100, -100, 0.5, 500]}
          />
        </directionalLight>

        {/* Orbit Control */}
        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          enabled={!snap.isDragging}
          enablePan={false}
          enableRotate
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.75}
          minZoom={20}
          maxZoom={150}
        />

        {/* Gizmo*/}
        <GizmoHelper alignment="top-left" margin={[50, 50]}>
          <GizmoViewport labelColor="white" axisHeadScale={1} />
        </GizmoHelper>
      </Canvas>
    </div>
  );
};

export default Scene;
