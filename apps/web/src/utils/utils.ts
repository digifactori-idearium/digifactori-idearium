export const deepCloneSceneState = (sceneState: IdeoramaState | ModelsInfo) => {
    console.log("sceneState.objects: ", sceneState.objects)
    const newObjects = copyObjects(sceneState.objects)
      return {
        global: {...sceneState.global},
        background: {...sceneState.background},
        info: {...sceneState.info},
        floor: {...sceneState.floor},
        objects: newObjects
      }
}

const copyObjects = (objects: Record<string, ObjectState>): Record<string, ObjectState> => {
  const newObjects: Record<string, ObjectState> = {};
  for (const [key, value] of Object.entries(objects)) {

    newObjects[key] = {
      ...value,
      info: { ...value.info },
      transform: {
        position: {
          x: value.transform.position.x,
          y: value.transform.position.y,
          z: value.transform.position.z
        },
        rotation: {
          x: value.transform.rotation.x,
          y: value.transform.rotation.y,
          z: value.transform.rotation.z
        },
        scale: value.transform.scale
      },
      style: { ...value.style },
      advanced: { ...value.advanced },
      actions: []
    };
  }
  return newObjects;
}

export const stackNewState = (sceneState: IdeoramaState) => {
    sceneState.current += 1
    sceneState.newest = sceneState.current
    const copy = deepCloneSceneState(sceneState)
    sceneState.history[sceneState.current] = copy
    sceneState.newest = sceneState.current
}

export const resetState = (sceneState: IdeoramaState) => {
    const copy = deepCloneSceneState(sceneState.history[sceneState.current])
    sceneState.global = copy.global
    sceneState.background = copy.background
    sceneState.info = copy.info
    sceneState.floor = copy.floor
    sceneState.objects = copy.objects
}