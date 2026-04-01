/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { subscribeKey } from 'valtio/utils';

import {
  setCleanup,
  runCleanup,
  cleanObject,
  clearTweens,
} from '@/lib/actionRuntime';
import { ActionRegistry } from '@/lib/actionsRegistry';
import { sceneState } from '@/stores';

export function useTrigger(
  objectId: string,
  ref: React.RefObject<THREE.Object3D | null>,
  trigger: TriggerType
): void {
  const prevVersionRef = useRef<number>(-1);
  const runningIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    //  Stop every action this hook started
    function stopOwned(): void {
      runningIdsRef.current.forEach(id => runCleanup(id));
      runningIdsRef.current.clear();
    }

    // Full object stop: tweens + all registered cleanups + particles
    function stopObject(): void {
      stopOwned();

      if (ref.current) {
        clearTweens(ref.current);

        const obj = sceneState.objects[objectId];
        if (obj?.transform) {
          const t = obj.transform;

          // Restore ref from store
          ref.current.position.set(t.position.x, t.position.y, t.position.z);
          ref.current.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
          ref.current.scale.set(t.scale, t.scale, t.scale);
        }
      }

      cleanObject(objectId);
    }

    //  Start all matching actions
    function startActions(): void {
      if (!ref.current) return;
      const obj = sceneState.objects[objectId];
      if (!obj) return;

      const version = obj.actionsVersion ?? 0;
      if (version === prevVersionRef.current) return;
      prevVersionRef.current = version;

      stopOwned();

      const triggered: ActionConfig[] =
        obj.actions?.filter((a: ActionConfig) => a.trigger === trigger) ?? [];

      triggered.forEach((a: ActionConfig) => {
        const handler = ActionRegistry[a.subType];
        if (!handler?.execute || !ref.current) return;

        const cleanup = handler.execute(ref.current, { ...a.config });
        setCleanup(a.id, cleanup, objectId);
        runningIdsRef.current.add(a.id);
      });
    }

    // Mode subscription
    const unsubMode = subscribeKey(sceneState, 'mode', (mode: string) => {
      if (mode === 'edit') {
        stopObject();
        prevVersionRef.current = -1;
        return;
      }
      if (mode === 'play') {
        prevVersionRef.current = -1;
        startActions();
      }
    });

    // Object subscription
    const unsubObject = subscribeKey(
      sceneState.objects,
      objectId as keyof typeof sceneState.objects,
      () => {
        if (sceneState.mode === 'play') startActions();
      }
    );

    // Initial run
    if (sceneState.mode === 'play') {
      prevVersionRef.current = -1;
      startActions();
    }

    return () => {
      unsubMode();
      unsubObject();
      stopObject();
      prevVersionRef.current = -1;
    };
  }, [objectId, trigger]);
}
