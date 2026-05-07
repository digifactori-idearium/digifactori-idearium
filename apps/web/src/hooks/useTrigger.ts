/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { subscribeKey } from 'valtio/utils';

import { ActionRegistry } from '@/lib/actions/registery';
import {
  setCleanup,
  runCleanup,
  cleanObject,
  clearTweens,
} from '@/lib/actions/runtime';
import { sceneState } from '@/stores';

export function useTrigger(
  objectId: string,
  ref: React.RefObject<THREE.Object3D | null>,
  trigger: TriggerType
): (() => void) | void {
  const prevVersionRef = useRef<number>(-1);
  const runningIdsRef = useRef<Set<string>>(new Set());
  const sequenceTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const triggerActionsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    function clearSequenceTimers(): void {
      sequenceTimersRef.current.forEach(t => clearTimeout(t));
      sequenceTimersRef.current = [];
    }

    function stopOwned(): void {
      clearSequenceTimers();
      runningIdsRef.current.forEach(id => runCleanup(id));
      runningIdsRef.current.clear();
      if (ref.current) clearTweens(ref.current);
    }

    function stopObject(): void {
      stopOwned();

      if (ref.current) {
        clearTweens(ref.current);

        const obj = sceneState.objects[objectId];
        if (obj?.transform) {
          const t = obj.transform;
          ref.current.position.set(t.position.x, t.position.y, t.position.z);
          ref.current.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
          ref.current.scale.set(t.scale, t.scale, t.scale);
        }
      }

      cleanObject(objectId);
    }

    function runAction(a: ActionConfig): number {
      if (!ref.current) return 0;
      const handler = ActionRegistry[a.subType];
      if (!handler?.execute) return 0;

      runCleanup(a.id);
      const cleanup = handler.execute(ref.current, { ...a.config });
      setCleanup(a.id, cleanup, objectId);
      runningIdsRef.current.add(a.id);

      return handler.getDuration?.(a.config) ?? 0;
    }

    function startActions(): void {
      if (!ref.current) return;
      const obj = sceneState.objects[objectId];
      if (!obj) return;

      const version = obj.actionsVersion ?? 0;
      if (version === prevVersionRef.current) return;
      prevVersionRef.current = version;

      stopOwned();

      const triggered: ActionConfig[] =
        obj.actions?.filter(
          (a: ActionConfig) => a.trigger === trigger && a.active !== false
        ) ?? [];

      if (triggered.length === 0) return;

      let delay = 0;
      triggered.forEach(a => {
        const timer = setTimeout(() => {
          runAction(a);
        }, delay);
        sequenceTimersRef.current.push(timer);
        delay += ActionRegistry[a.subType]?.getDuration?.(a.config) ?? 0;
      });
    }

    function executeTriggeredActions(): void {
      if (!ref.current) return;
      const obj = sceneState.objects[objectId];
      if (!obj) return;

      stopOwned();

      const triggered: ActionConfig[] =
        obj.actions?.filter(
          (a: ActionConfig) => a.trigger === trigger && a.active !== false
        ) ?? [];

      if (triggered.length === 0) return;

      let delay = 0;
      triggered.forEach(a => {
        const timer = setTimeout(() => {
          runAction(a);
        }, delay);
        sequenceTimersRef.current.push(timer);
        delay += ActionRegistry[a.subType]?.getDuration?.(a.config) ?? 0;
      });
    }

    triggerActionsRef.current = executeTriggeredActions;

    const unsubMode = subscribeKey(sceneState, 'mode', (mode: string) => {
      if (mode === 'edit') {
        stopObject();
        prevVersionRef.current = -1;
        return;
      }
      if (mode === 'play') {
        prevVersionRef.current = -1;
        if (trigger === 'onStart') {
          startActions();
        }
      }
    });

    const unsubObject = subscribeKey(
      sceneState.objects,
      objectId as keyof typeof sceneState.objects,
      () => {
        if (sceneState.mode === 'play' && trigger === 'onStart') {
          startActions();
        }
      }
    );

    if (sceneState.mode === 'play' && trigger === 'onStart') {
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

  return trigger === 'onTap'
    ? (triggerActionsRef.current ?? (() => {}))
    : undefined;
}
