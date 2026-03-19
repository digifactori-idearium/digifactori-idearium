/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { subscribe } from 'valtio';

import { setCleanup, runCleanup } from '@/lib/actionRuntime';
import { ActionRegistry } from '@/lib/actionsRegistry';
import { sceneState } from '@/stores';

export function useTrigger(
  objectId: string,
  ref: React.RefObject<THREE.Object3D | null>,
  trigger: TriggerType
) {
  const prevKeyRef = useRef<string>('');
  const runningIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!ref.current) return;

    const runActions = () => {
      const obj = sceneState.objects[objectId];
      if (!ref.current) return;

      const triggered = obj?.actions?.filter(a => a.trigger === trigger) ?? [];

      const key = JSON.stringify(
        triggered.map(a => ({ id: a.id, config: a.config }))
      );
      if (key === prevKeyRef.current) return;
      prevKeyRef.current = key;

      runningIdsRef.current.forEach(id => runCleanup(id));
      runningIdsRef.current.clear();

      triggered.forEach(a => {
        const handler = ActionRegistry[a.subType];
        if (handler?.execute && ref.current) {
          setCleanup(a.id, handler.execute(ref.current, { ...a.config }));
          runningIdsRef.current.add(a.id);
        }
      });
    };

    runActions();

    const unsub = subscribe(sceneState, () => runActions());

    return () => {
      unsub();
      runningIdsRef.current.forEach(id => runCleanup(id));
      runningIdsRef.current.clear();
      prevKeyRef.current = '';
    };
  }, [objectId, trigger]);
}
