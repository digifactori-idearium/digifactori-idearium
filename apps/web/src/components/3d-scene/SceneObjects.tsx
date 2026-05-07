import { Suspense } from 'react';
import { useSnapshot } from 'valtio';

import { Model } from './Model';

import { sceneState } from '@/stores';

export function SceneObjects() {
  const objects = useSnapshot(sceneState.objects);

  return (
    <Suspense fallback={null}>
      {Object.entries(objects).map(([id, obj]: [string, any]) => (
        <Model
          key={id}
          id={id}
          name={obj.info.name || ''}
          file={obj.info.file || ''}
        />
      ))}
    </Suspense>
  );
}
