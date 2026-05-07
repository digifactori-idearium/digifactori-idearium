import { useDroppable } from '@dnd-kit/core';
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';

import { SceneEnvironment } from './SceneEnvironment';
import { SceneFloor } from './SceneFloor';
import { SceneLighting } from './SceneLighting';
import { SceneObjects } from './SceneObjects';

import { AssetsDropHandler } from '@/components/assets/AssetsDropHandler';
import { ActionTicker } from '@/lib/actions/runtime';
import { actions, sceneState } from '@/stores';

export function Scene() {
  const isDragging = useSnapshot(sceneState).isDragging;
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas-droppable' });

  return (
    <div
      id="canvas-container"
      ref={setNodeRef}
      className={`w-full h-full ${isOver ? 'droppable active' : 'droppable'}`}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        shadows={{ type: THREE.PCFShadowMap }}
        orthographic
        camera={{ zoom: 50, position: [-50, 30, -50], near: 0.1, far: 2000 }}
        resize={{ debounce: 0 }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => e.preventDefault()}
        onPointerMissed={() => {
          if (!isDragging) actions.selectObject(null);
        }}
      >
        <ActionTicker />
        <AssetsDropHandler />
        <SceneEnvironment />
        <SceneLighting />

        <Physics gravity={[0, -9.81, 0]}>
          <SceneFloor />
          <SceneObjects />
        </Physics>

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          enabled={!isDragging}
          enablePan={false}
          enableRotate
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.75}
          minZoom={20}
          maxZoom={150}
        />
        <GizmoHelper alignment="top-left" margin={[50, 50]}>
          <GizmoViewport labelColor="white" axisHeadScale={1} />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}

export default Scene;
