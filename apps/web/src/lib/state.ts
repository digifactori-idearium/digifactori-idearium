export const deepCloneSceneState = (sceneState: {
  objects: Record<string, ObjectState>;
}) => {
  const newObjects = copyObjects(sceneState.objects);
  return {
    objects: newObjects,
  };
};

const copyObjects = (
  objects: Record<string, ObjectState>
): Record<string, ObjectState> => {
  const newObjects: Record<string, ObjectState> = {};
  for (const [key, value] of Object.entries(objects)) {
    newObjects[key] = {
      ...value,
      info: { ...value.info },
      transform: {
        position: {
          x: value.transform.position.x,
          y: value.transform.position.y,
          z: value.transform.position.z,
        },
        rotation: {
          x: value.transform.rotation.x,
          y: value.transform.rotation.y,
          z: value.transform.rotation.z,
        },
        scale: value.transform.scale,
      },
      style: { ...value.style },
      advanced: { ...value.advanced },
      actions: [],
    };
  }
  return newObjects;
};

export const stackNewState = (sceneState: IdeoramaState) => {
  sceneState.current += 1;
  sceneState.newest = sceneState.current;
  const copy = deepCloneSceneState(sceneState);
  sceneState.history[sceneState.current] = copy;
};
/**
 *
 * @param sceneState
 * Resets sceneState with the current state in history
 * Resets only objects (for now)
 */
export const resetState = (sceneState: IdeoramaState) => {
  const copy = deepCloneSceneState(sceneState.history[sceneState.current]);
  sceneState.objects = copy.objects;
};
