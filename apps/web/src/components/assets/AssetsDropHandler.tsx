import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { actions } from '@/stores';

export function AssetsDropHandler() {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    const handleDropSignal = (e: any) => {
      const { asset, x, y } = e.detail;

      const rect = gl.domElement.getBoundingClientRect();

      const canvasX = x - rect.left;
      const canvasY = y - rect.top;

      const mouse = new THREE.Vector2(
        (canvasX / rect.width) * 2 - 1,
        -(canvasY / rect.height) * 2 + 1
      );

      raycaster.current.setFromCamera(mouse, camera);

      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );

      if (intersects.length > 0) {
        const hit = intersects.find(i => i.object.visible) || intersects[0];
        actions.spawnAssetAtPosition(asset, hit.point);
      } else {
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const targetVector = new THREE.Vector3();
        raycaster.current.ray.intersectPlane(groundPlane, targetVector);
        actions.spawnAssetAtPosition(asset, targetVector);
      }
    };

    window.addEventListener('canvas-drop', handleDropSignal as EventListener);
    return () =>
      window.removeEventListener(
        'canvas-drop',
        handleDropSignal as EventListener
      );
  }, [camera, gl, scene]);

  return null;
}
